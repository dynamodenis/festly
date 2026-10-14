import { ClientOnly } from "@tanstack/react-router"
import AnimatedContent from "@/components/reactbits/AnimatedContent"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
  distance?: number
}

/**
 * Scroll-in reveal. The server and no-JS clients get plain visible markup;
 * after hydration the ReactBits/GSAP wrapper takes over. Use below the fold
 * only, so the swap never shows.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  distance = 60,
}: RevealProps) {
  const reducedMotion = usePrefersReducedMotion()
  const plain = <div className={className}>{children}</div>
  if (reducedMotion) return plain

  return (
    <ClientOnly fallback={plain}>
      <AnimatedContent
        className={className}
        delay={delay}
        distance={distance}
        duration={1.1}
        ease="power3.out"
        threshold={0.15}
      >
        {children}
      </AnimatedContent>
    </ClientOnly>
  )
}
