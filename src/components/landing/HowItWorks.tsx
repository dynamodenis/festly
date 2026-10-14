import { Palette, PenLine, Send } from "lucide-react"
import { Reveal } from "./Reveal"
import { SectionHeading } from "./SectionHeading"

const STEPS = [
  {
    icon: Palette,
    title: "Choose a template",
    body: "Start from a design made for your occasion, from candlelit weddings to golden birthdays.",
  },
  {
    icon: PenLine,
    title: "Make it yours",
    body: "Add names, photos, your story and your song. Watch every change appear live.",
  },
  {
    icon: Send,
    title: "Share one link",
    body: "Send it on WhatsApp, email or a QR code. Guests RSVP in seconds, no app needed.",
  },
]

export function HowItWorks() {
  return (
    <section
      id="how"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-28 sm:px-6"
    >
      <SectionHeading
        eyebrow="How it works"
        title="Three steps to a"
        accent="perfect invitation"
      />
      <ol className="relative mt-20 grid gap-12 md:grid-cols-3 md:gap-8">
        <div
          aria-hidden="true"
          className="absolute top-8 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent md:block"
        />
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <Reveal delay={i * 0.15} className="relative text-center">
              <div className="relative mx-auto grid size-16 place-items-center rounded-full border border-gold/30 bg-ink">
                <step.icon className="size-6 text-gold" aria-hidden="true" />
                <span className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-gold nums text-xs font-medium text-ink">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-6 heading-3">{step.title}</h3>
              <p className="mx-auto mt-3 max-w-xs body-copy">{step.body}</p>
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  )
}
