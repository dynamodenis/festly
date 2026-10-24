import { Link, createFileRoute } from "@tanstack/react-router"
import { ExternalLink, PencilLine, Plus } from "lucide-react"
import { useEffect } from "react"
import { UserMenu } from "@/components/auth/UserMenu"
import { BrandLink } from "@/components/brand/ButtonLink"
import { Logo } from "@/components/landing/Nav"
import { cn } from "@/lib/utils"
import { listMyInvitationsFn } from "@/server/invitations/invitations.functions"
import { getTemplateMeta } from "@/templates/registry"

export const Route = createFileRoute("/_authed/dashboard")({
  loader: () => listMyInvitationsFn(),
  head: () => ({ meta: [{ title: "My invitations · Festly" }] }),
  component: Dashboard,
})

type Row = Awaited<ReturnType<typeof listMyInvitationsFn>>[number]

const updated = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

function Dashboard() {
  const invitations = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const firstName = user.name?.trim().split(/\s+/)[0]

  // Portalled menus render on <body>; give them the brand tokens too.
  useEffect(() => {
    document.body.classList.add("theme-festly")
    return () => document.body.classList.remove("theme-festly")
  }, [])

  return (
    <div className="theme-festly min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              to="/templates"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
            >
              Templates
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl">
              {firstName ? `Hi ${firstName}` : "My invitations"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {invitations.length === 0
                ? "Pick a template to start your first invitation."
                : `${invitations.length} invitation${invitations.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <BrandLink to="/templates" size="md">
            <Plus className="size-4" aria-hidden="true" />
            New invitation
          </BrandLink>
        </div>

        {invitations.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {invitations.map((row) => (
              <InvitationCard key={row.id} row={row} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}

function InvitationCard({ row }: { row: Row }) {
  const meta = getTemplateMeta(row.templateId)
  const published = row.status === "published" && row.slug
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
      <Link
        to="/editor/$invitationId"
        params={{ invitationId: row.id }}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
        aria-label={`Edit ${row.title}`}
      >
        {meta && (
          <img
            src={meta.thumbnail}
            alt=""
            loading="lazy"
            className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
        <span
          className={cn(
            "absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium",
            published
              ? "bg-emerald-400/90 text-emerald-950"
              : "bg-background/85 text-foreground"
          )}
        >
          {published ? "Live" : "Draft"}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h2 className="truncate font-display text-xl">{row.title}</h2>
        <p className="text-xs text-muted-foreground">
          {meta?.name ?? row.templateId} · edited{" "}
          {updated.format(new Date(row.updatedAt))}
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            to="/editor/$invitationId"
            params={{ invitationId: row.id }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/85"
          >
            <PencilLine className="size-3.5" aria-hidden="true" />
            Edit
          </Link>
          {published && (
            <a
              href={`/i/${row.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-muted"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              View live
            </a>
          )}
        </div>
      </div>
    </li>
  )
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <p className="font-display text-2xl">Nothing here yet</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Choose a design, add your names, date and venue, and share one link with
        every guest.
      </p>
      <BrandLink to="/templates" className="mt-6" arrow>
        Browse templates
      </BrandLink>
    </div>
  )
}
