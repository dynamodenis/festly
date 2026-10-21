import { createFileRoute, notFound } from "@tanstack/react-router"
import { getPublishedFn } from "@/server/invitations/invitations.functions"
import { TemplateRenderer } from "@/templates/TemplateRenderer"

/**
 * The public invitation. Phase 4 ships the essentials (SSR render of the
 * published config); Phase 6 adds OG images, RSVP/wish actions, guest
 * names, rate limits and analytics.
 */
export const Route = createFileRoute("/i/$slug")({
  loader: async ({ params }) => {
    const invitation = await getPublishedFn({ data: { slug: params.slug } })
    if (!invitation) throw notFound()
    return invitation
  },
  head: ({ loaderData }) => {
    const seo = loaderData?.config.seo
    const title = seo?.title ?? loaderData?.config.event.title ?? "Invitation"
    const description = seo?.description ?? loaderData?.config.texts.message
    return {
      meta: [
        { title },
        ...(description ? [{ name: "description", content: description }] : []),
        { property: "og:title", content: title },
        ...(description
          ? [{ property: "og:description", content: description }]
          : []),
      ],
    }
  },
  component: PublicInvitation,
})

function PublicInvitation() {
  const invitation = Route.useLoaderData()
  return (
    <TemplateRenderer
      templateId={invitation.templateId}
      config={invitation.config}
      mode="public"
      slug={invitation.slug}
    />
  )
}
