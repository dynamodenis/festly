// Browser upload helpers: a PUT that reports progress (fetch cannot) and a
// minimum display time so fast uploads still show their state.

export type UploadStage = "resizing" | "uploading" | "saving"
export type UploadProgress = { stage: UploadStage; percent?: number }
export type OnUploadProgress = (progress: UploadProgress) => void

/** Thrown when the browser could not reach storage at all (usually CORS). */
export class UploadNetworkError extends Error {
  constructor() {
    super(
      "Could not reach storage. If you use R2, check the bucket's CORS rule allows PUT from this site (docs/STORAGE.md)."
    )
    this.name = "UploadNetworkError"
  }
}

type XhrLike = Pick<
  XMLHttpRequest,
  "open" | "setRequestHeader" | "send" | "abort" | "status" | "responseText"
> & {
  upload: Pick<XMLHttpRequestUpload, "onprogress">
  onload: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null
  onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => unknown) | null
}

export function putWithProgress(
  target: { url: string; method: "PUT"; headers: Record<string, string> },
  body: Blob,
  onProgress?: (percent: number) => void,
  createXhr: () => XhrLike = () => new XMLHttpRequest()
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = createXhr()
    xhr.open(target.method, target.url)
    for (const [name, value] of Object.entries(target.headers))
      xhr.setRequestHeader(name, value)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0)
        onProgress?.(
          Math.min(100, Math.round((event.loaded / event.total) * 100))
        )
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve()
      } else {
        reject(
          new Error(
            `Upload rejected by storage (${xhr.status})${xhr.responseText ? `: ${xhr.responseText.slice(0, 200)}` : ""}`
          )
        )
      }
    }
    xhr.onerror = () => reject(new UploadNetworkError())
    xhr.send(body)
  })
}

/** Resolve (or reject) no sooner than `ms`, so a spinner never just flickers. */
export async function minDuration<T>(
  work: Promise<T>,
  ms: number,
  wait = (t: number) => new Promise((r) => setTimeout(r, t))
): Promise<T> {
  const [result] = await Promise.allSettled([work, wait(ms)])
  if (result.status === "rejected") throw result.reason
  return result.value
}

export function describeProgress(progress: UploadProgress | null): string {
  if (!progress) return ""
  if (progress.stage === "resizing") return "Resizing…"
  if (progress.stage === "saving") return "Saving…"
  return `Uploading ${progress.percent ?? 0}%`
}
