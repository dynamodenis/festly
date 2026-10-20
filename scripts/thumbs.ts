// pnpm thumbs [--url http://localhost:3000] [--only wedding/ivory-garden]
//
// Captures each template's cover screen from /preview at a 390×844 phone
// viewport (2× pixel density) and writes public/thumbs/<category>-<slug>.webp,
// the path in meta.thumbnail. Needs a running app (`pnpm dev` or `pnpm start`).
// WebP is encoded by the browser itself, so no image library is required.
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { chromium } from "playwright-core"
import { TEMPLATE_METAS } from "../src/templates/registry"

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}
const base = (
  flag("url") ??
  process.env.THUMBS_URL ??
  "http://localhost:3000"
).replace(/\/$/, "")
const only = flag("only")
const VIEWPORT = { width: 390, height: 844 }
const QUALITY = 0.82

// Hide dev tooling, toasts and the floating music chip: everything in <body>
// except the page itself.
const HIDE_CHROME = `
  body > *:not(:first-child) { display: none !important; }
  button[aria-label$="music" i] { display: none !important; }
  *, *::before, *::after { animation-play-state: paused !important; caret-color: transparent !important; }
`

async function main() {
  try {
    await fetch(base, { signal: AbortSignal.timeout(5000) })
  } catch {
    console.error(
      `No app at ${base}. Start one with \`pnpm dev\` (or pass --url).`
    )
    process.exit(1)
  }

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
  })
  const metas = TEMPLATE_METAS.filter((m) => !only || m.id === only)
  let failed = 0

  for (const meta of metas) {
    if (!/^\/thumbs\/[a-z0-9-]+\.webp$/.test(meta.thumbnail)) {
      console.error(
        `✗ ${meta.id}: thumbnail must look like /thumbs/<name>.webp`
      )
      failed++
      continue
    }
    const page = await context.newPage()
    const errors: Array<string> = []
    page.on("pageerror", (e) => errors.push(e.message))
    try {
      // motion=none: deterministic frame, no WebGL (software GL renders it badly).
      await page.goto(`${base}/preview/${meta.id}?device=mobile&motion=none`, {
        waitUntil: "networkidle",
      })
      await page.addStyleTag({ content: HIDE_CHROME })
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all(
          [...document.images]
            .filter(
              (img) => img.getBoundingClientRect().top < window.innerHeight
            )
            .map((img) =>
              img.complete ? null : img.decode().catch(() => null)
            )
        )
      })
      await page.waitForTimeout(400)
      const png = await page.screenshot({ type: "png" })

      const webp = await page.evaluate(
        async ({ data, quality }) => {
          const blob = await (
            await fetch(`data:image/png;base64,${data}`)
          ).blob()
          const bitmap = await createImageBitmap(blob)
          const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
          canvas.getContext("2d")?.drawImage(bitmap, 0, 0)
          const out = await canvas.convertToBlob({
            type: "image/webp",
            quality,
          })
          const bytes = new Uint8Array(await out.arrayBuffer())
          let binary = ""
          for (const b of bytes) binary += String.fromCharCode(b)
          return { type: out.type, base64: btoa(binary) }
        },
        { data: png.toString("base64"), quality: QUALITY }
      )
      if (webp.type !== "image/webp")
        throw new Error(`browser produced ${webp.type}, not WebP`)

      const file = join("public", meta.thumbnail)
      await mkdir(dirname(file), { recursive: true })
      const buffer = Buffer.from(webp.base64, "base64")
      await writeFile(file, buffer)
      const note = errors.length ? ` (page errors: ${errors.join("; ")})` : ""
      console.log(
        `✓ ${meta.id} → ${file} (${Math.round(buffer.length / 1024)} KB)${note}`
      )
    } catch (error) {
      failed++
      console.error(
        `✗ ${meta.id}: ${error instanceof Error ? error.message : String(error)}`
      )
    } finally {
      await page.close()
    }
  }

  await browser.close()
  if (failed) process.exit(1)
}

await main()
