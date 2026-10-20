import type { z } from "zod"
import { schema } from "./schema"

const photo = (seed: string, w: number, h: number, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
})

export const defaults: z.infer<typeof schema> = schema.parse({
  hosts: [
    {
      name: "Amara Wanjiku",
      shortName: "Amara",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Kamau",
      photo: photo("amara", 800, 1000, "Amara smiling in a garden"),
    },
    {
      name: "Kofi Mensah",
      shortName: "Kofi",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Mensah",
      photo: photo("kofi", 800, 1000, "Kofi in a linen suit"),
    },
  ],
  event: {
    type: "wedding",
    title: "The Wedding of Amara & Kofi",
    subtitle: "Together with their families",
    subEvents: [
      {
        label: "Ceremony",
        start: "2027-06-12T15:00:00+03:00",
        end: "2027-06-12T16:00:00+03:00",
      },
      {
        label: "Reception",
        start: "2027-06-12T18:00:00+03:00",
        end: "2027-06-12T23:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-06-12T15:00:00+03:00",
    end: "2027-06-12T23:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "The Old Mill Gardens",
    address: "Limuru Road, Nairobi, Kenya",
    placeName: "The Old Mill Gardens",
    lat: -1.2195,
    lng: 36.8073,
    notes: "Parking is available at the main gate.",
  },
  theme: {
    paletteId: "ivory-gold",
    fontPairId: "playfair-inter",
    motionLevel: "full",
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "gentle-piano" },
    loop: true,
  },
  texts: {
    coverTitle: "The wedding of",
    coverButtonLabel: "Open invitation",
    headline: "Amara & Kofi",
    message:
      "With joy in our hearts, we invite you to celebrate the beginning of our forever.",
    dressCode: "Garden formal · soft neutrals",
    rsvpPrompt:
      "Kindly let us know if you can join us by the fifteenth of May.",
    rsvpDeadline: "2027-05-15T23:59:00+03:00",
    closing:
      "Your presence is the greatest gift. We cannot wait to celebrate with you.",
    footerNote: "Amara & Kofi · Nairobi · June 2027",
  },
  gallery: [
    photo("ivory1", 1200, 1500, "Walking through tall grass at golden hour"),
    photo("ivory2", 1200, 1500, "Hands with rings"),
    photo("ivory3", 1200, 1500, "Laughing under a tree"),
    photo("ivory4", 1200, 1500, "A quiet moment by the lake"),
    photo("ivory5", 1200, 1500, "Dancing in the garden"),
    photo("ivory6", 1200, 1500, "The proposal"),
  ],
  story: [
    {
      date: "2021",
      title: "We met",
      body: "A rainy afternoon, one umbrella and a long walk home.",
    },
    {
      date: "2023",
      title: "The first trip",
      body: "Diani beach, a borrowed camera and far too many photos of the sea.",
    },
    {
      date: "2026",
      title: "She said yes",
      body: "On the hill above the old mill, exactly where we will say our vows.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [
      { bank: "KCB Bank", holder: "Amara Wanjiku", number: "1234567890" },
    ],
    ewallets: [
      { provider: "M-Pesa", holder: "Kofi Mensah", number: "0700 000 000" },
    ],
    registryLinks: [
      { label: "Our registry", url: "https://example.com/registry" },
    ],
  },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: true,
    gifts: true,
    calendar: true,
    map: true,
    music: true,
  },
  sectionsOrder: [
    "hero",
    "hosts",
    "countdown",
    "event",
    "story",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "gifts",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Amara & Kofi · 12 June 2027",
    description: "Join us as we celebrate our wedding in Nairobi.",
  },
})
