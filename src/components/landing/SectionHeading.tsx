import { Reveal } from "./Reveal"
import { Ornament } from "./InvitationCard"

type SectionHeadingProps = {
  eyebrow: string
  title: string
  accent: string
  description?: string
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
}: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 heading-2">
        {title} <span className="text-gold-gradient italic">{accent}</span>
      </h2>
      <Ornament className="mx-auto mt-6 w-32 text-gold/60" />
      {description && <p className="mt-6 lead">{description}</p>}
    </Reveal>
  )
}
