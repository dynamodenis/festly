import { createContext, useContext } from "react"
import type { Path } from "@/lib/set-in"
import type { UploadPurpose } from "@/lib/upload-policy"
import type { OnUploadProgress } from "@/lib/upload-request"
import type { InvitationConfigBase } from "@/templates/_shared/schema"
import type { TemplateModule } from "@/templates/types"
import type { UploadedAudio, UploadedImage } from "./useUploader"

export type EditorConfig = InvitationConfigBase & Record<string, unknown>

export type EditorApi = {
  invitationId: string
  module: TemplateModule
  config: EditorConfig
  set: (path: Path, value: unknown) => void
  /** First validation message at exactly this path. */
  issue: (path: Path) => string | undefined
  /** How many issues live under this path prefix (for tab badges). */
  issueCount: (prefix: Path) => number
  uploadImage: (
    file: File,
    purpose: Exclude<UploadPurpose, "music">,
    onProgress?: OnUploadProgress
  ) => Promise<UploadedImage>
  uploadAudio: (
    file: File,
    onProgress?: OnUploadProgress
  ) => Promise<UploadedAudio>
  /** Which storage the server is using ("local" shows a dev badge). */
  storageDriver: "local" | "r2"
}

export const EditorContext = createContext<EditorApi | null>(null)

export function useEditor(): EditorApi {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error("useEditor must be used inside the editor")
  return ctx
}
