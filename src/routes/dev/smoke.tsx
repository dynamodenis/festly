import { ClientOnly, createFileRoute } from "@tanstack/react-router"
import { Suspense, lazy } from "react"
import BlurText from "@/components/reactbits/BlurText"
import { Button } from "@/components/ui/button"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

// WebGL stays out of the SSR pass and the initial client bundle.
const Aurora = lazy(() => import("@/components/reactbits/Aurora"))

const HEADLINE = "Festly renders on the server"
const AURORA_STOPS = ["#f5c16c", "#e879a9", "#7c6cf5"]

export const Route = createFileRoute("/dev/smoke")({
  head: () => ({ meta: [{ title: "Smoke test · Festly" }] }),
  component: SmokePage,
})

function SmokePage() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <main className="relative min-h-svh overflow-hidden bg-slate-950 text-white">
      {/* Static gradient: what the server, no-JS clients and reduced-motion users see. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,193,108,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(124,108,245,0.35),transparent_50%)]"
      />

      {!reducedMotion && (
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <div aria-hidden="true" className="absolute inset-0">
              <Aurora colorStops={AURORA_STOPS} blend={0.6} speed={0.8} />
            </div>
          </Suspense>
        </ClientOnly>
      )}

      <section className="relative mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-xs tracking-[0.3em] text-white/60 uppercase">
          Phase 0 smoke test
        </p>

        {/* Plain text is SSR'd as the fallback so crawlers and no-JS users still read it. */}
        <ClientOnly
          fallback={
            <p className="text-4xl font-semibold text-balance sm:text-6xl">
              {HEADLINE}
            </p>
          }
        >
          <BlurText
            text={HEADLINE}
            delay={90}
            animateBy="words"
            className="justify-center text-4xl font-semibold text-balance sm:text-6xl"
          />
        </ClientOnly>

        <p className="max-w-prose text-white/70">
          BlurText and Aurora were fetched from the ReactBits registry through
          the shadcn CLI. Aurora is lazy-loaded inside a client-only boundary
          and skipped when you prefer reduced motion.
        </p>

        <div className="flex gap-3">
          <Button variant="secondary" asChild>
            <a href="/">Home</a>
          </Button>
          <Button variant="outline" className="bg-transparent" asChild>
            <a href="view-source:/dev/smoke">View source</a>
          </Button>
        </div>
      </section>
    </main>
  )
}
