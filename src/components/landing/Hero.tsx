import { ClientOnly } from "@tanstack/react-router"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { Sparkles } from "lucide-react"
import { ButtonLink } from "@/components/brand/ButtonLink"
import BlurText from "@/components/reactbits/BlurText"
import ShinyText from "@/components/reactbits/ShinyText"
import { HeroBackdrop } from "./HeroBackdrop"
import { InvitationCard } from "./InvitationCard"

const HEADLINE_LEAD = "Invitations your guests"

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, 140])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={ref}
      className="relative isolate min-h-svh overflow-hidden pt-28 pb-20 lg:pt-36"
    >
      <HeroBackdrop />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-ink"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
        <motion.div
          style={{ y: copyY, opacity: fade }}
          className="text-center lg:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-umber/60 px-4 py-1.5 eyebrow text-[0.65rem] tracking-[0.15em] whitespace-nowrap backdrop-blur sm:text-xs sm:tracking-[0.3em]">
            <Sparkles className="size-3.5 text-gold" aria-hidden="true" />
            <ShinyText
              text="Weddings · Birthdays · Every celebration"
              color="#c9a05a"
              shineColor="#f3e8d6"
              speed={3}
              delay={1.5}
            />
          </span>

          <h1 className="mt-8 heading-1">
            <ClientOnly
              fallback={<span className="block">{HEADLINE_LEAD}</span>}
            >
              <BlurText
                text={HEADLINE_LEAD}
                delay={110}
                animateBy="words"
                direction="bottom"
                className="justify-center lg:justify-start"
              />
            </ClientOnly>
            <span className="text-gold-gradient block pb-2 italic">
              will never forget.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl lead lg:mx-0">
            Pick a template, add your story, and share one beautiful link.
            Countdown, map, music, RSVPs and wishes come built in.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <ButtonLink href="#start" arrow>
              Create your invitation
            </ButtonLink>
            <ButtonLink href="#templates" variant="outline">
              Browse templates
            </ButtonLink>
          </div>
        </motion.div>

        <motion.div
          style={{ y: phoneY }}
          className="relative mx-auto w-full max-w-[19rem]"
        >
          <div
            aria-hidden="true"
            className="absolute -inset-16 -z-10 animate-glow rounded-full bg-[radial-gradient(circle,rgba(201,160,90,0.35),transparent_65%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="absolute -inset-10 -z-10 animate-spin-slow rounded-full border border-dashed border-gold/20"
          />
          <div className="animate-float">
            <div className="rounded-[2.6rem] bg-gradient-to-b from-gold-soft/70 via-bronze/60 to-bark p-[3px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
              <div className="h-[34rem] rounded-[2.5rem] bg-ink p-2">
                <InvitationCard />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
