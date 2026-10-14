import { ButtonLink } from "@/components/brand/ButtonLink"
import { Ornament } from "./InvitationCard"
import { Reveal } from "./Reveal"

export function FinalCta() {
  return (
    <section id="start" className="relative scroll-mt-24 px-4 py-32 sm:px-6">
      <Reveal className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-gold/20 bg-[radial-gradient(ellipse_at_top,#3a2716_0%,#1a120c_55%,#110b07_100%)] px-6 py-20 text-center sm:px-16">
        <div
          aria-hidden="true"
          className="absolute -top-32 left-1/2 -z-0 size-96 -translate-x-1/2 animate-glow rounded-full bg-gold/20 blur-3xl"
        />
        <div className="relative">
          <Ornament className="mx-auto w-36 text-gold" />
          <h2 className="mt-8 heading-2">
            Your celebration
            <span className="text-gold-gradient block italic">
              deserves a grand entrance.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg lead">
            Create your first invitation in minutes. No design skills, no code,
            no printing.
          </p>
          <ButtonLink href="#templates" arrow className="mt-10">
            Start creating
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  )
}
