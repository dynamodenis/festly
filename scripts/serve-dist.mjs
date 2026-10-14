// Minimal Node host for the production build (`pnpm build` → dist/).
// The deployment adapter (Nitro/Vercel/Netlify/Cloudflare) is chosen in
// Phase 8; until then this serves dist/client statically and hands every
// other request to the TanStack Start fetch handler in dist/server/server.js.
import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize } from "node:path"
import { Readable } from "node:stream"

const PORT = Number(process.env.PORT ?? 3000)
const CLIENT_DIR = new URL("../dist/client/", import.meta.url).pathname
const { default: entry } = await import("../dist/server/server.js")

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8",
}

function tryStatic(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, "http://x").pathname)
  const file = normalize(join(CLIENT_DIR, pathname))
  if (!file.startsWith(CLIENT_DIR) || !existsSync(file)) return false
  if (!statSync(file).isFile()) return false
  const immutable = pathname.startsWith("/assets/")
  res.writeHead(200, {
    "content-type": MIME[extname(file)] ?? "application/octet-stream",
    "cache-control": immutable
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600",
  })
  createReadStream(file).pipe(res)
  return true
}

async function handle(req, res) {
  if ((req.method === "GET" || req.method === "HEAD") && tryStatic(req, res))
    return
  const url = `http://${req.headers.host ?? `localhost:${PORT}`}${req.url}`
  const hasBody = req.method !== "GET" && req.method !== "HEAD"
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? "half" : undefined,
  })
  const response = await entry.fetch(request)
  res.writeHead(response.status, Object.fromEntries(response.headers))
  if (response.body) Readable.fromWeb(response.body).pipe(res)
  else res.end()
}

createServer((req, res) => {
  handle(req, res).catch((error) => {
    console.error(error)
    if (!res.headersSent) res.writeHead(500)
    res.end("Internal Server Error")
  })
}).listen(PORT, () => {
  console.log(`▶ serving dist/ on http://localhost:${PORT}`)
})
