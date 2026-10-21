import { Link, useRouter } from "@tanstack/react-router"
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  LoaderCircle,
  PencilLine,
  TriangleAlert,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ComponentType } from "react"
import { DeviceToggle } from "@/components/gallery/DeviceToggle"
import { Logo } from "@/components/landing/Nav"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { DeviceId } from "@/lib/devices"
import { pathKey, setIn, type Path } from "@/lib/set-in"
import { cn } from "@/lib/utils"
import { CATEGORY_LABELS, templateParams } from "@/templates/catalog"
import { loadTemplate } from "@/templates/registry"
import type { TemplateModule } from "@/templates/types"
import {
  EditorContext,
  type EditorApi,
  type EditorConfig,
} from "./EditorContext"
import { EditorPreview } from "./EditorPreview"
import { BasicsTab } from "./tabs/BasicsTab"
import { DesignTab } from "./tabs/DesignTab"
import { EventVenueTab } from "./tabs/EventVenueTab"
import { GalleryTab } from "./tabs/GalleryTab"
import { GiftsTab } from "./tabs/GiftsTab"
import { MusicTab } from "./tabs/MusicTab"
import { PeopleTab } from "./tabs/PeopleTab"
import { SectionsTab } from "./tabs/SectionsTab"
import { SharingTab, type PublishState } from "./tabs/SharingTab"
import { StoryTab } from "./tabs/StoryTab"
import { TextsTab } from "./tabs/TextsTab"
import { useAutosave, type SaveState } from "./useAutosave"
import { useUploader } from "./useUploader"

export type DraftData = {
  id: string
  templateId: string
  status: "draft" | "published" | "archived"
  slug: string | null
  draftConfig: EditorConfig
  updatedAt: string
  publishedAt: string | null
}

type TabId =
  | "basics"
  | "people"
  | "event"
  | "design"
  | "music"
  | "texts"
  | "sections"
  | "gallery"
  | "story"
  | "gifts"
  | "sharing"

/** Tabs and the config paths whose issues badge them. */
const TABS: Array<{ id: TabId; label: string; prefixes: Array<string> }> = [
  {
    id: "basics",
    label: "Basics",
    prefixes: [
      "event.type",
      "event.title",
      "event.subtitle",
      "datetime",
      "age",
      "graduation",
    ],
  },
  { id: "people", label: "People", prefixes: ["hosts"] },
  {
    id: "event",
    label: "Event & Venue",
    prefixes: ["venue", "event.subEvents"],
  },
  { id: "design", label: "Design", prefixes: ["theme"] },
  { id: "music", label: "Music", prefixes: ["music"] },
  { id: "texts", label: "Texts", prefixes: ["texts", "seo"] },
  {
    id: "sections",
    label: "Sections",
    prefixes: ["sectionsOrder", "features"],
  },
  { id: "gallery", label: "Gallery", prefixes: ["gallery"] },
  { id: "story", label: "Story", prefixes: ["story"] },
  { id: "gifts", label: "Gifts", prefixes: ["gifts"] },
  { id: "sharing", label: "Sharing", prefixes: [] },
]

const PANELS: Record<Exclude<TabId, "sharing">, ComponentType> = {
  basics: BasicsTab,
  people: PeopleTab,
  event: EventVenueTab,
  design: DesignTab,
  music: MusicTab,
  texts: TextsTab,
  sections: SectionsTab,
  gallery: GalleryTab,
  story: StoryTab,
  gifts: GiftsTab,
}

function SaveIndicator({
  state,
  onRetry,
}: {
  state: SaveState
  onRetry: () => void
}) {
  const copy: Record<
    SaveState,
    { text: string; icon: ComponentType<{ className?: string }>; tone: string }
  > = {
    saved: {
      text: "All changes saved",
      icon: CheckCircle2,
      tone: "text-emerald-400",
    },
    dirty: {
      text: "Unsaved changes",
      icon: PencilLine,
      tone: "text-muted-foreground",
    },
    saving: {
      text: "Saving…",
      icon: LoaderCircle,
      tone: "text-muted-foreground",
    },
    invalid: {
      text: "Fix highlighted fields to save",
      icon: TriangleAlert,
      tone: "text-amber-300",
    },
    conflict: {
      text: "Changed elsewhere",
      icon: AlertTriangle,
      tone: "text-destructive",
    },
    error: {
      text: "Save failed",
      icon: AlertTriangle,
      tone: "text-destructive",
    },
  }
  const { text, icon: Icon, tone } = copy[state]
  return (
    <p
      role="status"
      aria-live="polite"
      data-save-state={state}
      className={cn("flex items-center gap-1.5 text-xs", tone)}
    >
      <Icon
        className={cn("size-3.5", state === "saving" && "animate-spin")}
        aria-hidden="true"
      />
      {text}
      {state === "error" && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 underline underline-offset-2"
        >
          Retry
        </button>
      )}
    </p>
  )
}

export function Editor({ draft }: { draft: DraftData }) {
  const [module, setModule] = useState<TemplateModule | null>(null)
  useEffect(() => {
    let alive = true
    void loadTemplate(draft.templateId).then((m) => alive && setModule(m))
    return () => {
      alive = false
    }
  }, [draft.templateId])

  // Popovers portal to <body>; give them the brand theme too.
  useEffect(() => {
    document.body.classList.add("theme-festly")
    return () => document.body.classList.remove("theme-festly")
  }, [])

  if (!module) {
    return (
      <div className="theme-festly grid min-h-svh place-items-center bg-background text-muted-foreground">
        <LoaderCircle
          className="size-8 animate-spin text-primary"
          aria-label="Loading editor"
        />
      </div>
    )
  }
  return <EditorLoaded draft={draft} module={module} />
}

function EditorLoaded({
  draft,
  module,
}: {
  draft: DraftData
  module: TemplateModule
}) {
  const router = useRouter()
  const [config, setConfig] = useState<EditorConfig>(draft.draftConfig)
  const [tab, setTab] = useState<TabId>("basics")
  const [device, setDevice] = useState<DeviceId>("mobile")
  const [view, setView] = useState<"edit" | "preview">("edit")
  const [published, setPublished] = useState<PublishState>({
    status: draft.status,
    slug: draft.slug,
    publishedAt: draft.publishedAt,
  })
  const { uploadImage, uploadAudio } = useUploader(draft.id)

  const validation = useMemo(
    () => module.schema.safeParse(config),
    [module, config]
  )
  const issues = useMemo(() => {
    const map = new Map<string, string>()
    if (!validation.success)
      for (const issue of validation.error.issues)
        if (!map.has(pathKey(issue.path)))
          map.set(pathKey(issue.path), issue.message)
    return map
  }, [validation])

  const autosave = useAutosave({
    id: draft.id,
    config,
    valid: validation.success,
    initialUpdatedAt: draft.updatedAt,
  })

  const set = useCallback(
    (path: Path, value: unknown) => setConfig((c) => setIn(c, path, value)),
    []
  )
  const issueCount = useCallback(
    (prefix: Path) => {
      const key = pathKey(prefix)
      let n = 0
      for (const k of issues.keys())
        if (k === key || k.startsWith(`${key}.`)) n++
      return n
    },
    [issues]
  )
  const api = useMemo<EditorApi>(
    () => ({
      invitationId: draft.id,
      module,
      config,
      set,
      issue: (p) => issues.get(pathKey(p)),
      issueCount,
      uploadImage,
      uploadAudio,
    }),
    [
      draft.id,
      module,
      config,
      set,
      issues,
      issueCount,
      uploadImage,
      uploadAudio,
    ]
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault()
        void autosave.flush()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [autosave])

  const tabIssues = (t: (typeof TABS)[number]) =>
    t.prefixes.reduce((n, p) => n + issueCount(p.split(".")), 0)
  const Panel = tab === "sharing" ? null : PANELS[tab]

  return (
    <EditorContext.Provider value={api}>
      <div className="theme-festly flex h-svh flex-col bg-background text-foreground">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-4">
            <Logo />
            <span
              aria-hidden="true"
              className="hidden h-6 w-px bg-border sm:block"
            />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm">
                <Link
                  to="/templates/$category/$slug"
                  params={templateParams(module.meta.id)}
                  className="hover:text-primary"
                >
                  {module.meta.name}
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  · {CATEGORY_LABELS[module.meta.category]}
                </span>
              </p>
              <SaveIndicator
                state={autosave.state}
                onRetry={() => void autosave.flush()}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="sm:hidden">
              <SaveIndicator
                state={autosave.state}
                onRetry={() => void autosave.flush()}
              />
            </div>
            <div
              role="radiogroup"
              aria-label="View"
              className="flex rounded-full border border-border p-0.5 lg:hidden"
            >
              {(["edit", "preview"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  onClick={() => setView(v)}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs capitalize",
                    view === v
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {v === "edit" ? (
                    <PencilLine className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-3.5" aria-hidden="true" />
                  )}
                  {v}
                </button>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => setTab("sharing")}
              className="hidden sm:inline-flex"
            >
              {published.status === "published" ? "Share" : "Publish"}
            </Button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)]">
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-col border-r border-border",
              view === "preview" && "hidden lg:flex"
            )}
          >
            <nav
              aria-label="Editor sections"
              className="shrink-0 [scrollbar-width:none] overflow-x-auto border-b border-border px-3 py-2"
            >
              <ul className="flex w-max gap-1">
                {TABS.map((t) => {
                  const count = tabIssues(t)
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setTab(t.id)}
                        aria-current={tab === t.id ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                          tab === t.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {t.label}
                        {count > 0 && (
                          <span
                            className="rounded-full bg-destructive px-1.5 text-[0.65rem] font-semibold text-white"
                            aria-label={`${count} issues`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
              <h2 className="sr-only">
                {TABS.find((t) => t.id === tab)?.label}
              </h2>
              <div className="flex flex-col gap-8 pb-24">
                {Panel ? (
                  <Panel />
                ) : (
                  <SharingTab
                    published={published}
                    canPublish={
                      autosave.state === "saved" && validation.success
                    }
                    lastSavedAt={autosave.lastSavedAt}
                    onPublished={(state, updatedAt) => {
                      setPublished(state)
                      autosave.adoptVersion(updatedAt)
                      void router.invalidate()
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <section
            aria-label="Preview"
            className={cn(
              "relative min-h-0 flex-col items-center gap-4 overflow-hidden bg-umber/40 p-4",
              view === "edit" ? "hidden lg:flex" : "flex"
            )}
          >
            <DeviceToggle value={device} onChange={setDevice} />
            <EditorPreview
              templateId={module.meta.id}
              config={config}
              device={device}
              className="min-h-0 w-full flex-1"
            />
          </section>
        </div>
      </div>

      <Dialog open={autosave.state === "conflict"}>
        <DialogContent showCloseButton={false} className="theme-festly">
          <DialogHeader>
            <DialogTitle>This invitation changed somewhere else</DialogTitle>
            <DialogDescription>
              It was edited in another tab or device after you opened it. Reload
              to see that version, or keep yours and overwrite it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload theirs
            </Button>
            <Button type="button" onClick={() => void autosave.flush(true)}>
              Keep mine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EditorContext.Provider>
  )
}
