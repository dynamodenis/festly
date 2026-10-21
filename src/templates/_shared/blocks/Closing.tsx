import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useInvitation } from "../context"
import { Section, type SectionTone } from "./Section"
import { hostNames } from "./hosts"
import { MusicCredit } from "./MusicPlayer"

export type ClosingVariant = "signature" | "banner"

type ClosingProps = {
  variant?: ClosingVariant
  tone?: SectionTone
  /** Ornament layer behind the closing words. */
  decor?: ReactNode
  /** Shown above the closing words (monogram, seal, badge). */
  crest?: ReactNode
  className?: string
  children?: ReactNode
}

/** Closing words signed by the hosts in foil, followed by the footer. */
export function Closing({
  variant = "signature",
  tone,
  decor,
  crest,
  className,
  children,
}: ClosingProps) {
  const { config } = useInvitation()
  const { texts, hosts } = config
  return (
    <Section
      id="closing"
      width="narrow"
      tone={tone ?? (variant === "banner" ? "tint" : "plain")}
      decor={decor}
      className={cn(
        "text-center",
        variant === "banner" && "py-28 sm:py-36",
        className
      )}
    >
      {crest && <div className="mb-8 flex justify-center">{crest}</div>}
      <p className="font-inv-display text-2xl leading-relaxed text-balance sm:text-3xl">
        {texts.closing}
      </p>
      <p className="mt-10 text-[0.7rem] tracking-[0.3em] text-inv-muted uppercase">
        With love
      </p>
      <p className="inv-foil mt-3 font-inv-display text-5xl leading-tight sm:text-6xl">
        {hostNames(hosts)}
      </p>
      {children}
    </Section>
  )
}

/** Tiny footer every invitation ends with. */
export function Footer({ className }: { className?: string }) {
  const { config } = useInvitation()
  return (
    <footer
      className={cn(
        "flex flex-col items-center gap-2 px-6 pt-6 pb-24 text-center text-xs text-inv-muted",
        className
      )}
    >
      {config.texts.footerNote && <p>{config.texts.footerNote}</p>}
      <MusicCredit />
      <p>
        Made with{" "}
        <a
          href="/"
          className="underline-offset-4 hover:text-inv-fg hover:underline"
        >
          Festly
        </a>
      </p>
    </footer>
  )
}
