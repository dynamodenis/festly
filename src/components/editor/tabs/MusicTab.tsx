import { useServerFn } from "@tanstack/react-start"
import {
  CloudUpload,
  Library,
  LoaderCircle,
  Pause,
  Play,
  Waves,
} from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { availableLibrary, libraryTrackUrl } from "@/lib/music-library"
import { describeProgress, type UploadProgress } from "@/lib/upload-request"
import { cn } from "@/lib/utils"
import { resolveSoundCloudFn } from "@/server/music/music.functions"
import type { MusicSource } from "@/templates/_shared/schema"
import { useEditor } from "../EditorContext"
import { Group, ToggleField } from "../fields"

type Kind = MusicSource["kind"]
const KINDS: Array<{
  kind: Kind
  label: string
  icon: typeof Library
  note: string
}> = [
  {
    kind: "library",
    label: "Festly library",
    icon: Library,
    note: "Starts the moment guests open the invitation.",
  },
  {
    kind: "upload",
    label: "Upload a song",
    icon: CloudUpload,
    note: "Your own MP3. Starts on open, on every phone.",
  },
  {
    kind: "soundcloud",
    label: "SoundCloud link",
    icon: Waves,
    note: "Shows SoundCloud's player. iPhone guests tap ▶ once.",
  },
]

function LibraryPicker() {
  const { config, set } = useEditor()
  const tracks = availableLibrary()
  const audio = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const selected =
    config.music.source?.kind === "library"
      ? config.music.source.trackId
      : undefined

  useEffect(() => () => audio.current?.pause(), [])

  const preview = (id: string, url: string) => {
    audio.current ??= new Audio()
    if (playing === id) {
      audio.current.pause()
      return setPlaying(null)
    }
    audio.current.src = url
    audio.current.onended = () => setPlaying(null)
    audio.current
      .play()
      .then(() => setPlaying(id))
      .catch(() => setPlaying(null))
  }

  if (tracks.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        The library is empty. Add tracks with <code>pnpm music:add</code>.
      </p>
    )
  return (
    <ul
      role="radiogroup"
      aria-label="Library tracks"
      className="flex flex-col gap-2"
    >
      {tracks.map((t) => (
        <li
          key={t.id}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-3 py-2",
            selected === t.id ? "border-primary bg-primary/10" : "border-border"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={
              playing === t.id ? `Stop ${t.title}` : `Preview ${t.title}`
            }
            onClick={() => preview(t.id, libraryTrackUrl(t))}
          >
            {playing === t.id ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
          </Button>
          <button
            type="button"
            role="radio"
            aria-checked={selected === t.id}
            onClick={() =>
              set(["music", "source"], { kind: "library", trackId: t.id })
            }
            className="flex flex-1 flex-col text-left focus-visible:outline-none"
          >
            <span className="text-sm font-medium">{t.title}</span>
            <span className="text-xs text-muted-foreground">
              {t.artist} · {t.mood.join(", ")}
              {t.placeholder && " · dev placeholder"}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Linear bar for the song upload; fills while sending, pulses while saving. */
function UploadProgressBar({
  fileName,
  progress,
}: {
  fileName: string
  progress: UploadProgress
}) {
  const saving = progress.stage === "saving"
  const percent = saving ? 100 : (progress.percent ?? 0)
  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="min-w-0 truncate font-medium">{fileName}</span>
        <span className="shrink-0 nums text-muted-foreground">
          {saving ? "Saving…" : `${percent}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Uploading ${fileName}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-200 ease-out",
            saving && "animate-pulse"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

function UploadPicker() {
  const { config, set, uploadAudio } = useEditor()
  const input = useRef<HTMLInputElement>(null)
  const rightsId = useId()
  const [rights, setRights] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [fileName, setFileName] = useState("")
  const busy = progress !== null
  const current =
    config.music.source?.kind === "upload" ? config.music.source : undefined

  const pick = async (file: File | undefined) => {
    if (!file) return
    setFileName(file.name)
    setProgress({ stage: "uploading", percent: 0 })
    try {
      const ref = await uploadAudio(file, setProgress)
      set(["music", "source"], {
        kind: "upload",
        assetKey: ref.assetKey,
        url: ref.url,
        title: file.name.replace(/\.[^.]+$/, "").slice(0, 200),
        rightsConfirmedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
      })
      toast.success("Song uploaded", { description: file.name })
    } catch (error) {
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setProgress(null)
      if (input.current) input.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {current && (
        <p className="text-sm">
          Current:{" "}
          <span className="font-medium">
            {current.title ?? "Uploaded song"}
          </span>
        </p>
      )}
      <label htmlFor={rightsId} className="flex items-start gap-3 text-sm">
        <input
          id={rightsId}
          type="checkbox"
          checked={rights}
          onChange={(e) => setRights(e.target.checked)}
          className="mt-1 size-4 accent-[var(--primary)]"
        />
        <span>
          I own this recording or have permission to share it on my invitation.
        </span>
      </label>
      <Button
        type="button"
        variant="outline"
        className="self-start"
        disabled={!rights || busy}
        onClick={() => input.current?.click()}
      >
        {busy ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <CloudUpload aria-hidden="true" />
        )}
        {busy
          ? describeProgress(progress)
          : current
            ? "Replace song"
            : "Choose MP3"}
      </Button>
      {progress && (
        <UploadProgressBar fileName={fileName} progress={progress} />
      )}
      <p className="text-xs text-muted-foreground">
        MP3, M4A or OGG, up to 10 MB.
      </p>
      <input
        ref={input}
        type="file"
        accept="audio/mpeg,audio/mp4,audio/ogg"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  )
}

function SoundCloudPicker() {
  const { config, set } = useEditor()
  const resolve = useServerFn(resolveSoundCloudFn)
  const [link, setLink] = useState("")
  const [busy, setBusy] = useState(false)
  const current =
    config.music.source?.kind === "soundcloud" ? config.music.source : undefined

  const submit = async () => {
    setBusy(true)
    try {
      set(["music", "source"], await resolve({ data: { url: link } }))
      setLink("")
    } catch (error) {
      toast.error("Could not use that link", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {current && (
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          {current.artworkUrl && (
            <img
              src={current.artworkUrl}
              alt=""
              className="size-14 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium">{current.title}</p>
            <p className="truncate text-sm text-muted-foreground">
              {current.artist} · SoundCloud
            </p>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <label htmlFor="sc-link" className="sr-only">
          SoundCloud track link
        </label>
        <Input
          id="sc-link"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://soundcloud.com/artist/track"
        />
        <Button type="button" onClick={submit} disabled={!link || busy}>
          {busy && <LoaderCircle className="animate-spin" aria-hidden="true" />}{" "}
          Use
        </Button>
      </div>
      <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
        <li>
          Guests see SoundCloud's compact player with credit to the artist.
        </li>
        <li>
          On iPhone, guests tap ▶ once; on Android and computers it starts by
          itself.
        </li>
        <li>SoundCloud Go+ songs only play a 30-second preview.</li>
      </ul>
    </div>
  )
}

export function MusicTab() {
  const { config, set } = useEditor()
  const music = config.music
  // Which picker is open; the saved source only changes when a track is chosen.
  const [kind, setKind] = useState<Kind>(music.source?.kind ?? "library")
  return (
    <>
      <Group title="Background music">
        <ToggleField
          path={["music", "enabled"]}
          label="Play music"
          help="Starts when guests tap the cover button."
        />
      </Group>
      {music.enabled && (
        <>
          <Group title="Source">
            <div
              role="radiogroup"
              aria-label="Music source"
              className="grid gap-2 sm:grid-cols-3"
            >
              {KINDS.map(({ kind: k, label, icon: Icon, note }) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={kind === k}
                  onClick={() => setKind(k)}
                  data-kind={k}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    kind === k
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                  <span className="mt-2 block text-sm font-medium">
                    {label}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {note}
                  </span>
                </button>
              ))}
            </div>
            <PickerFor kind={kind} />
          </Group>
          <Group title="Playback">
            <div className="flex flex-col gap-2">
              <label htmlFor="start-at" className="text-sm font-medium">
                Start at{" "}
                <span className="nums text-muted-foreground">
                  {music.startAtSec ?? 0}s
                </span>
              </label>
              <Slider
                id="start-at"
                min={0}
                max={180}
                step={1}
                value={[music.startAtSec ?? 0]}
                onValueChange={([v]) => set(["music", "startAtSec"], v)}
                aria-label="Start at seconds"
              />
            </div>
            <ToggleField path={["music", "loop"]} label="Loop" />
          </Group>
        </>
      )}
    </>
  )
}

function PickerFor({ kind }: { kind: Kind }) {
  if (kind === "upload") return <UploadPicker />
  if (kind === "soundcloud") return <SoundCloudPicker />
  return <LibraryPicker />
}
