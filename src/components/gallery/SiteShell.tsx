import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"
import { Footer } from "@/components/landing/Footer"
import { Nav } from "@/components/landing/Nav"

/** Marketing chrome (dark espresso + gold) shared by the landing and gallery pages. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grain min-h-svh overflow-x-clip bg-ink text-cream selection:bg-gold/30 selection:text-cream">
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
