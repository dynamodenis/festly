import { createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import { Editor } from "@/components/editor/Editor"
import { getDraftFn } from "@/server/invitations/invitations.functions"

/** Split-pane invitation editor (Phase 4). Loads the owner's draft. */
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
  component: EditorPage,
})

function EditorPage() {
  const draft = Route.useLoaderData()
  // A fresh editor per invitation (and after publish → invalidate → new data).
  return <Editor key={draft.id} draft={draft} />
}
