import { useServerFn } from "@tanstack/react-start"
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  LoaderCircle,
  MessageCircle,
  Rocket,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { renderSVG } from "uqr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useHydrated } from "@/hooks/use-hydrated"
import { suggestSlug } from "@/lib/slug"
import { cn } from "@/lib/utils"
import {
  checkSlugFn,
  publishFn,
} from "@/server/invitations/invitations.functions"
import { hostNames } from "@/templates/_shared/blocks/hosts"
import { useEditor } from "../EditorContext"
import { Group } from "../fields"

export type PublishState = {
  status: "draft" | "published" | "archived"
  slug: string | null
  publishedAt: string | null
}

type Props = {
  published: PublishState
  /** Draft saved and valid: publishing uses the stored draft. */
  canPublish: boolean
  lastSavedAt: string
  onPublished: (state: PublishState, updatedAt: string) => void
}

type Checked = { slug: string; available: boolean; reason?: string }
type Availability =
  | { state: "idle" | "checking" }
  | { state: "ok" }
  | { state: "bad"; reason: string }

export function SharingTab({
  published,
  canPublish,
  lastSavedAt,
  onPublished,
}: Props) {
  const { config, invitationId } = useEditor()
  const checkSlug = useServerFn(checkSlugFn)
  const publish = useServerFn(publishFn)
  const hydrated = useHydrated()
  const [slug, setSlug] = useState(
    () =>
      published.slug ??
      suggestSlug(hostNames(config.hosts), config.datetime.start)
  )
  const [checked, setChecked] = useState<Checked | null>(null)
  const [busy, setBusy] = useState(false)
  const normalized = slug.trim().toLowerCase()

  // Results are tied to the slug they were checked for, so "checking" is derived.
  const availability: Availability = !normalized
    ? { state: "idle" }
    : checked?.slug !== normalized
      ? { state: "checking" }
      : checked.available
        ? { state: "ok" }
        : { state: "bad", reason: checked.reason ?? "Unavailable" }

  useEffect(() => {
    if (!normalized) return
    const timer = window.setTimeout(async () => {
      try {
        const result = await checkSlug({
          data: { slug: normalized, id: invitationId },
        })
        setChecked(
          result.available
            ? { slug: normalized, available: true }
            : { slug: normalized, available: false, reason: result.reason }
        )
      } catch {
        setChecked({
          slug: normalized,
          available: false,
          reason: "Could not check right now",
        })
      }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [normalized, checkSlug, invitationId])

  const live = published.status === "published" && published.slug
  const url =
    live && hydrated
      ? `${window.location.origin}/i/${published.slug}`
      : live
        ? `/i/${published.slug}`
        : ""
  const qr = useMemo(
    () =>
      url && hydrated
        ? `data:image/svg+xml;utf8,${encodeURIComponent(renderSVG(url, { border: 2 }))}`
        : "",
    [url, hydrated]
  )
  const changedSincePublish = !!(
    live &&
    published.publishedAt &&
    lastSavedAt > published.publishedAt
  )

  const doPublish = async () => {
    setBusy(true)
    try {
      const result = await publish({ data: { id: invitationId, slug } })
      onPublished(
        {
          status: "published",
          slug: result.slug,
          publishedAt: result.publishedAt,
        },
        result.updatedAt
      )
      toast.success("Your invitation is live!", {
        description: `/i/${result.slug}`,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.replace(/^\w+: /, "")
          : String(error)
      toast.error("Could not publish", { description: message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Group
        title="Web address"
        description="Lowercase letters, numbers and dashes."
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="slug" className="text-sm font-medium">
            Link
          </label>
          <div className="flex items-center overflow-hidden rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <span className="shrink-0 border-r border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
              /i/
            </span>
            <Input
              id="slug"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
              }
              maxLength={60}
              aria-describedby="slug-status"
              className="rounded-none border-0 focus-visible:ring-0"
            />
          </div>
          <p
            id="slug-status"
            aria-live="polite"
            className={cn(
              "flex items-center gap-1.5 text-xs",
              availability.state === "bad"
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {availability.state === "checking" && (
              <LoaderCircle
                className="size-3.5 animate-spin"
                aria-hidden="true"
              />
            )}
            {availability.state === "ok" && (
              <CheckCircle2
                className="size-3.5 text-emerald-400"
                aria-hidden="true"
              />
            )}
            {availability.state === "bad" && (
              <XCircle className="size-3.5" aria-hidden="true" />
            )}
            {availability.state === "checking"
              ? "Checking…"
              : availability.state === "ok"
                ? "Available"
                : availability.state === "bad"
                  ? availability.reason
                  : ""}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={doPublish}
          disabled={busy || !canPublish || availability.state !== "ok"}
          className="self-start"
        >
          {busy ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Rocket aria-hidden="true" />
          )}
          {live
            ? changedSincePublish
              ? "Publish changes"
              : "Republish"
            : "Publish invitation"}
        </Button>
        {!canPublish && (
          <p className="text-xs text-amber-300">
            Save your changes (and fix any highlighted fields) before
            publishing.
          </p>
        )}
        {changedSincePublish && (
          <p className="text-xs text-amber-300">
            You have edits that guests cannot see yet.
          </p>
        )}
      </Group>

      {live && (
        <Group
          title="Share"
          description="Send the link, or print the QR code on cards."
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {qr && (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={qr}
                  alt={`QR code linking to ${url}`}
                  className="size-40 rounded-xl bg-white p-2"
                />
                <a
                  href={qr}
                  download={`${published.slug}-qr.svg`}
                  className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                >
                  <Download className="size-3.5" aria-hidden="true" /> Download
                  QR
                </a>
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <code
                data-testid="share-url"
                className="truncate rounded-lg bg-muted px-3 py-2 text-sm"
              >
                {url}
              </code>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigator.clipboard.writeText(url).then(
                      () => toast("Link copied"),
                      () => toast.error("Copy failed")
                    )
                  }
                >
                  <Copy aria-hidden="true" /> Copy link
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={url} target="_blank" rel="noopener">
                    <ExternalLink aria-hidden="true" /> Open
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${config.event.title}\n${url}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle aria-hidden="true" /> WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Group>
      )}
    </>
  )
}
