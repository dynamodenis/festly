import { Link, createFileRoute, notFound } from "@tanstack/react-router"
import { CheckCircle2, Hammer } from "lucide-react"
import { z } from "zod"
import { Logo } from "@/components/landing/Nav"
import { getDraftFn } from "@/server/invitations/invitations.functions"
import { CATEGORY_LABELS, templateParams } from "@/templates/catalog"
import { TemplateRenderer } from "@/templates/TemplateRenderer"
import { getTemplateMeta } from "@/templates/registry"

/**
 * Editor placeholder (Phase 4 builds the real split-pane editor). Proves the
 * "Use this template" round trip: loads the draft row for its owner and
 * renders it.
 */
export const Route = createFileRoute("/editor/$invitationId")({
  loader: async ({ params }) => {
    if (!z.uuid().safeParse(params.invitationId).success) throw notFound()
    const draft = await getDraftFn({ data: { id: params.invitationId } })
    if (!draft) throw notFound()
    return draft
  },
  head: () => ({
    meta: [
      { title: "Editor · Festly" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditorStub,
})

function EditorStub() {
  const draft = Route.useLoaderData()
  const meta = getTemplateMeta(draft.templateId)
  const updated = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(draft.updatedAt))

  return (
    <div className="min-h-svh bg-ink">
      <header className="sticky top-0 z-50 border-b border-gold/10 bg-ink/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span aria-hidden="true" className="h-6 w-px bg-gold/20" />
            <div className="text-sm">
              <p className="text-cream">
                {meta?.name ?? draft.templateId}
                <span className="text-sand">
                  {" "}
                  · {meta ? CATEGORY_LABELS[meta.category] : "Template"}
                </span>
              </p>
              <p className="flex items-center gap-1.5 text-xs text-sand">
                <CheckCircle2
                  className="size-3.5 text-gold"
                  aria-hidden="true"
                />
                Draft saved {updated}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-gold/20 bg-umber/70 px-4 py-2 text-xs text-sand">
            <Hammer className="size-4 text-gold" aria-hidden="true" />
            The editor arrives in Phase 4. This is your draft as guests will see
            it.
          </div>
          {meta && (
            <Link
              to="/templates/$category/$slug"
              params={templateParams(meta.id)}
              className="link"
            >
              Back to template
            </Link>
          )}
        </div>
      </header>
      <TemplateRenderer
        templateId={draft.templateId}
        config={draft.draftConfig}
        mode="preview"
      />
    </div>
  )
}
