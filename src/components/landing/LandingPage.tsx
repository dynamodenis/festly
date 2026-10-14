import { MotionConfig } from "motion/react"
import { Features } from "./Features"
import { FinalCta } from "./FinalCta"
import { Footer } from "./Footer"
import { Hero } from "./Hero"
import { HowItWorks } from "./HowItWorks"
import { Marquee } from "./Marquee"
import { Nav } from "./Nav"
import { Numbers } from "./Numbers"
import { Showcase } from "./Showcase"

export function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grain min-h-svh overflow-x-clip bg-ink text-cream selection:bg-gold/30 selection:text-cream">
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <HowItWorks />
          <Features />
          <Numbers />
          <Showcase />
          <FinalCta />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
