import { ClientOnly } from "@tanstack/react-router"
import { Suspense, lazy } from "react"
import type { ReactNode } from "react"
import type { EffectiveMotion } from "../theme/motion"

const FadeContent = lazy(() => import("@/components/reactbits/FadeContent"))

type RevealProps = {
  children: ReactNode
  motion: EffectiveMotion
  className?: string
  delay?: number
}

/**
 * Scroll-in reveal for sections below the fold. Server and no-JS clients get
 * the plain markup; after hydration the GSAP wrapper animates it in. Skipped
 * entirely unless motion is "full".
 */
export function Reveal({
  children,
  motion,
  className,
  delay = 0,
}: RevealProps) {
  const plain = <div className={className}>{children}</div>
  if (motion !== "full") return plain
  return (
    <ClientOnly fallback={plain}>
      <Suspense fallback={plain}>
        <FadeContent
          className={className}
          effect="fade"
          blur
          duration={0.9}
          delay={delay}
          threshold={0.15}
        >
          {children}
        </FadeContent>
      </Suspense>
    </ClientOnly>
  )
}
