// Manage the curated music library (metadata in src/lib/music-library.json,
// files in storage under library/). Runs against the configured storage:
// R2 when R2_* is set, otherwise the local driver (.storage/).
//
//   pnpm music:add <file.mp3> --id calm-piano --title "Gymnopedie No 1" \
//     --artist "Kevin MacLeod" --license "CC BY 4.0" \
//     --license-url https://creativecommons.org/licenses/by/4.0/ \
//     --source-url <track page> --credit "<credit line>" --mood calm,romantic
//   pnpm music:placeholders     # two generated dev-only sketches
//   pnpm music:list
import { readFile, writeFile } from "node:fs/promises"
import { basename, extname } from "node:path"
import { LIBRARY_FILE, type LibraryTrack } from "../src/lib/music-library"
import { getStorage } from "../src/server/storage/index.server"
import {
  LOCAL_ROOT,
  writeLocalObject,
} from "../src/server/storage/local.server"

const MANIFEST = "src/lib/music-library.json"
const MIME: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
}

async function readManifest(): Promise<Array<LibraryTrack>> {
  return JSON.parse(await readFile(MANIFEST, "utf8")) as Array<LibraryTrack>
}

async function saveManifest(tracks: Array<LibraryTrack>) {
  tracks.sort(
    (a, b) =>
      Number(!!a.placeholder) - Number(!!b.placeholder) ||
      a.title.localeCompare(b.title)
  )
  await writeFile(MANIFEST, JSON.stringify(tracks, null, 2) + "\n")
}

async function putObject(key: string, mime: string, body: Uint8Array) {
  const storage = getStorage()
  if (storage.id === "local")
    return writeLocalObject(LOCAL_ROOT, key, mime, body)
  const target = await storage.createUploadTarget({
    key,
    mime,
    bytes: body.byteLength,
  })
  const res = await fetch(target.url, {
    method: "PUT",
    headers: target.headers,
    body: new Blob([body as BlobPart]),
  })
  if (!res.ok)
    throw new Error(`Upload failed (${res.status}): ${await res.text()}`)
}

async function addTrack(track: LibraryTrack, body: Uint8Array) {
  if (!LIBRARY_FILE.test(track.file))
    throw new Error(`Bad file name "${track.file}"`)
  await putObject(`library/${track.file}`, track.mime, body)
  const tracks = (await readManifest()).filter((t) => t.id !== track.id)
  tracks.push(track)
  await saveManifest(tracks)
  console.log(
    `✓ ${track.id} → library/${track.file} (${Math.round(body.byteLength / 1024)} KB, ${getStorage().id})`
  )
}

function flag(args: Array<string>, name: string): string | undefined {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}

/* ---------- placeholder sketches (dev only) ---------- */

/** 16-bit mono PCM WAV. */
function wav(samples: Float32Array, rate: number): Uint8Array {
  const out = new DataView(new ArrayBuffer(44 + samples.length * 2))
  const text = (o: number, s: string) =>
    [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)))
  text(0, "RIFF")
  out.setUint32(4, 36 + samples.length * 2, true)
  text(8, "WAVE")
  text(12, "fmt ")
  out.setUint32(16, 16, true)
  out.setUint16(20, 1, true)
  out.setUint16(22, 1, true)
  out.setUint32(24, rate, true)
  out.setUint32(28, rate * 2, true)
  out.setUint16(32, 2, true)
  out.setUint16(34, 16, true)
  text(36, "data")
  out.setUint32(40, samples.length * 2, true)
  samples.forEach((v, i) =>
    out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 0x7fff, true)
  )
  return new Uint8Array(out.buffer)
}

/** A soft arpeggiated I–V–vi–IV loop; seamless because it ends where it starts. */
function sketch({
  bpm,
  bars,
  wave,
  bright,
}: {
  bpm: number
  bars: number
  wave: "sine" | "triangle"
  bright: number
}) {
  const rate = 22050
  const beat = 60 / bpm
  const chords = [
    [60, 64, 67],
    [55, 59, 62],
    [57, 60, 64],
    [53, 57, 60],
  ]
  const len = Math.round(bars * 4 * beat * rate)
  const out = new Float32Array(len)
  const hz = (m: number) => 440 * 2 ** ((m - 69) / 12)
  const osc = (t: number, f: number) =>
    wave === "sine"
      ? Math.sin(2 * Math.PI * f * t)
      : (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * f * t))
  const step = beat / 2
  for (let n = 0; n * step * rate < len; n++) {
    const chord = chords[Math.floor((n * step) / (4 * beat)) % chords.length]
    const note = chord[n % 3] + (n % 6 >= 3 ? 12 : 0)
    const start = Math.round(n * step * rate)
    const dur = Math.round(step * 2.5 * rate)
    for (let i = 0; i < dur && start + i < len; i++) {
      const t = i / rate
      const env = Math.min(1, t * 80) * Math.exp(-t * (2.2 + bright))
      out[start + i] +=
        0.18 * env * (osc(t, hz(note)) + 0.3 * bright * osc(t, hz(note) * 2))
    }
    // Bass on each bar
    if (n % 8 === 0) {
      const bass = hz(chord[0] - 24)
      for (let i = 0; i < 4 * beat * rate && start + i < len; i++) {
        const t = i / rate
        out[start + i] +=
          0.12 * Math.exp(-t * 0.9) * Math.sin(2 * Math.PI * bass * t)
      }
    }
  }
  // Gentle fade at both ends so the loop point is silent-to-silent.
  const fade = Math.round(0.05 * rate)
  for (let i = 0; i < fade; i++) {
    out[i] *= i / fade
    out[len - 1 - i] *= i / fade
  }
  return wav(out, rate)
}

const PLACEHOLDERS: Array<[LibraryTrack, Parameters<typeof sketch>[0]]> = [
  [
    {
      id: "sketch-calm",
      title: "Calm Sketch",
      artist: "Festly (generated)",
      mood: ["calm", "romantic"],
      license: { name: "Festly placeholder", url: "https://festly.app" },
      credit: "Placeholder music generated by Festly",
      sourceUrl: "scripts/music-library.ts",
      file: "sketch-calm.wav",
      mime: "audio/wav",
      durationSec: 27,
      placeholder: true,
    },
    { bpm: 72, bars: 8, wave: "sine", bright: 0.2 },
  ],
  [
    {
      id: "sketch-bright",
      title: "Bright Sketch",
      artist: "Festly (generated)",
      mood: ["happy", "playful"],
      license: { name: "Festly placeholder", url: "https://festly.app" },
      credit: "Placeholder music generated by Festly",
      sourceUrl: "scripts/music-library.ts",
      file: "sketch-bright.wav",
      mime: "audio/wav",
      durationSec: 17,
      placeholder: true,
    },
    { bpm: 112, bars: 8, wave: "triangle", bright: 1 },
  ],
]

async function main() {
  const [command, ...args] = process.argv.slice(2)
  if (command === "placeholders") {
    for (const [track, recipe] of PLACEHOLDERS)
      await addTrack(track, sketch(recipe))
    return
  }
  if (command === "list") {
    for (const t of await readManifest())
      console.log(
        `${t.placeholder ? "(dev) " : ""}${t.id}: ${t.title} — ${t.artist} [${t.license.name}]`
      )
    return
  }
  if (command === "add") {
    const path = args.find(
      (a) => !a.startsWith("--") && !args[args.indexOf(a) - 1]?.startsWith("--")
    )
    const required = [
      "id",
      "title",
      "artist",
      "license",
      "license-url",
      "source-url",
      "credit",
    ] as const
    const missing = required.filter((name) => !flag(args, name))
    if (!path || missing.length) {
      console.error(
        `Usage: pnpm music:add <file> ${required.map((r) => `--${r} …`).join(" ")} [--mood a,b]`
      )
      process.exit(1)
    }
    const ext = extname(path).toLowerCase()
    const mime = MIME[ext]
    if (!mime) throw new Error(`Unsupported file type ${ext}`)
    const id = flag(args, "id")!
    await addTrack(
      {
        id,
        title: flag(args, "title")!,
        artist: flag(args, "artist")!,
        mood: (flag(args, "mood") ?? "").split(",").filter(Boolean),
        license: {
          name: flag(args, "license")!,
          url: flag(args, "license-url")!,
        },
        credit: flag(args, "credit")!,
        sourceUrl: flag(args, "source-url")!,
        file: `${id}${ext}`,
        mime,
      },
      new Uint8Array(await readFile(path))
    )
    console.log(`  source file: ${basename(path)}`)
    return
  }
  console.error("Commands: add <file> …, placeholders, list")
  process.exit(1)
}

await main()
