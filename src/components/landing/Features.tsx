import {
  CalendarClock,
  Gift,
  Images,
  Link2,
  Share2,
  MapPinned,
  MessageCircleHeart,
  Music,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import SpotlightCard from "@/components/reactbits/SpotlightCard"
import { cn } from "@/lib/utils"
import { Reveal } from "./Reveal"
import { SectionHeading } from "./SectionHeading"

type Feature = { icon: LucideIcon; title: string; body: string; wide?: boolean }

const FEATURES: Array<Feature> = [
  {
    icon: Users,
    title: "RSVPs that count themselves",
    body: "Guests reply in a tap. You see who is coming, party sizes and messages on one dashboard, ready to export.",
    wide: true,
  },
  {
    icon: CalendarClock,
    title: "Live countdown",
    body: "Every second until the big day, plus add-to-calendar in one tap.",
  },
  {
    icon: MapPinned,
    title: "Map & directions",
    body: "Your venue on a map with Google, Waze and Apple directions.",
  },
  {
    icon: Music,
    title: "Your song",
    body: "Music starts when the envelope opens.",
  },
  {
    icon: Images,
    title: "Gallery & story",
    body: "Photos and a timeline of how it all began.",
  },
  {
    icon: MessageCircleHeart,
    title: "Wishes wall",
    body: "Warm words from guests, moderated by you.",
  },
  {
    icon: Share2,
    title: "Share anywhere",
    body: "WhatsApp, email, QR code or a rich link preview.",
  },
  {
    icon: Gift,
    title: "Gifts made graceful",
    body: "Share registries, bank details or a QR code discreetly, so guests never have to ask.",
    wide: true,
  },
  {
    icon: Link2,
    title: "Personal guest links",
    body: "Greet every guest by name with their own link, and see exactly who has opened it.",
    wide: true,
  },
]

const SPOTLIGHT_SURFACE = {
  "--spotlight-card-surface": "#1a120c",
  "--spotlight-card-border": "rgba(201, 160, 90, 0.14)",
} as React.CSSProperties

export function Features() {
  return (
    <section id="features" className="relative scroll-mt-24 py-28">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(138,98,54,0.12),transparent_70%)]"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Everything included"
          title="More than a card."
          accent="A whole experience."
          description="Every invitation comes with the details guests need and the touches they remember."
        />
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <Reveal
              key={feature.title}
              delay={(i % 4) * 0.08}
              distance={40}
              className={cn(feature.wide && "sm:col-span-2")}
            >
              <SpotlightCard
                spotlightColor="#e6cb95"
                intensity={0.22}
                spotlightSize={300}
                style={SPOTLIGHT_SURFACE}
                className="h-full !p-7"
              >
                <feature.icon
                  className="size-7 text-gold"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="mt-5 heading-3">{feature.title}</h3>
                <p className="mt-2 body-copy">{feature.body}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
