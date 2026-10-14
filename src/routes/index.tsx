import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { publicEnv } from "@/env.public"

export const Route = createFileRoute("/")({ component: HomePage })

function HomePage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-6 px-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {publicEnv.VITE_APP_NAME}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Configurable invitation websites
        </h1>
        <p className="text-muted-foreground">
          Phase 0 scaffold: TanStack Start, shadcn/ui, Tailwind v4, ReactBits.
          The template gallery arrives in Phase 3.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link to="/dev/smoke">Open smoke test</Link>
        </Button>
      </div>
    </main>
  )
}
