import { cn } from "@/lib/utils"
import { Ornament } from "./InvitationCard"
import { Reveal } from "./Reveal"
import { SectionHeading } from "./SectionHeading"

type Sample = {
  category: string
  name: string
  title: string
  subtitle: string
  date: string
  surface: string
  titleClass: string
}

const SAMPLES: Array<Sample> = [
  {
    category: "Wedding",
    name: "Ivory Garden",
    title: "Lena & Marcus",
    subtitle: "are getting married",
    date: "18 · 09 · 2027",
    surface: "bg-[linear-gradient(160deg,#f3e8d6,#e2cfae)] text-ink",
    titleClass: "font-display italic text-bark",
  },
  {
    category: "Birthday",
    name: "Golden Milestone",
    title: "Fifty",
    subtitle: "& fabulous · Grace turns 50",
    date: "Sat 04 March",
    surface:
      "bg-[radial-gradient(circle_at_30%_20%,#4a341f,#160f09)] text-cream",
    titleClass: "font-display text-gold-gradient text-4xl sm:text-5xl",
  },
  {
    category: "Anniversary",
    name: "Golden Years",
    title: "25 Years",
    subtitle: "of David & Ruth",
    date: "Dinner at eight",
    surface: "bg-[linear-gradient(200deg,#2a1e14,#110b07)] text-cream",
    titleClass: "font-display italic text-gold-soft",
  },
  {
    category: "Graduation",
    name: "Cap & Gown",
    title: "Class of 2027",
    subtitle: "Celebrate Daniel with us",
    date: "Friday 25 June",
    surface: "bg-[linear-gradient(160deg,#8a6236,#3a2716)] text-cream",
    titleClass: "font-display text-cream",
  },
]

export function Showcase() {
  return (
    <section
      id="templates"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-28 sm:px-6"
    >
      <SectionHeading
        eyebrow="Templates"
        title="Designed for"
        accent="every occasion"
        description="Fifty templates are on the way, each one edited live and published in minutes."
      />
      <div className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {SAMPLES.map((sample, i) => (
          <Reveal key={sample.name} delay={i * 0.12} distance={80}>
            <article className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] transition-all duration-700 ease-out group-hover:-translate-y-3 group-hover:rotate-[-1.5deg] group-hover:border-gold/40 group-hover:shadow-[0_40px_70px_-25px_rgba(201,160,90,0.35)]">
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center p-6 text-center",
                    sample.surface
                  )}
                >
                  <div className="absolute inset-3 rounded-xl border border-current opacity-20" />
                  <Ornament className="w-20 text-gold" />
                  <h3
                    className={cn(
                      "mt-4 text-2xl leading-tight sm:mt-5 sm:text-3xl",
                      sample.titleClass
                    )}
                  >
                    {sample.title}
                  </h3>
                  <p className="mt-3 text-[0.65rem] tracking-[0.25em] uppercase opacity-70">
                    {sample.subtitle}
                  </p>
                  <p className="mt-6 nums text-sm opacity-80">{sample.date}</p>
                </div>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
              </div>
              <div className="mt-4 flex flex-col gap-1 px-1">
                <h4 className="heading-3">{sample.name}</h4>
                <span className="label">{sample.category}</span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
