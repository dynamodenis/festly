import { schema, type CapAndGownConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/1500`,
  width: 1200,
  height: 1500,
  alt,
})

export const defaults: CapAndGownConfig = schema.parse({
  graduation: {
    school: "University of Nairobi",
    degree: "Bachelor of Architecture",
    classOf: 2027,
  },
  hosts: [
    {
      name: "Daniel Otieno",
      shortName: "Daniel",
      role: "graduate",
      parentsLine: "With love from the Otieno family",
      photo: photo("daniel", "Daniel in cap and gown"),
    },
  ],
  event: {
    type: "graduation",
    title: "Daniel's Graduation Celebration",
    subtitle: "Five years, one degree, countless late nights",
    subEvents: [
      {
        label: "Commencement ceremony",
        start: "2027-09-24T10:00:00+03:00",
        end: "2027-09-24T12:30:00+03:00",
        venueRef: "Taifa Hall, University of Nairobi",
      },
      {
        label: "Lunch & toasts",
        start: "2027-09-24T14:00:00+03:00",
        end: "2027-09-24T17:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-09-24T10:00:00+03:00",
    end: "2027-09-24T17:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Otieno Residence",
    address: "Runda Grove, Nairobi, Kenya",
    lat: -1.2096,
    lng: 36.8147,
    notes: "Garden lunch; the ceremony itself is at Taifa Hall in the morning.",
  },
  theme: {
    paletteId: "navy-gold",
    fontPairId: "cinzel-garamond",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "wax", stamp: false },
  },
  music: { enabled: false, loop: true },
  texts: {
    coverTitle: "You are invited to celebrate",
    coverButtonLabel: "Open invitation",
    headline: "Class of 2027",
    message:
      "After five years of studios, deadlines and very strong coffee, Daniel is graduating. Join us to celebrate.",
    dressCode: "Smart casual",
    rsvpPrompt: "Please let us know if you can make it to lunch.",
    rsvpDeadline: "2027-09-10T23:59:00+03:00",
    closing: "Thank you for being part of the journey.",
    footerNote: "Daniel Otieno · B.Arch 2027",
  },
  gallery: [
    photo("grad1", "First day on campus"),
    photo("grad2", "Final-year studio model"),
    photo("grad3", "Thesis presentation"),
  ],
  story: [
    {
      date: "2022",
      title: "First day",
      body: "Walked into the studio with a borrowed T-square and a lot of questions.",
    },
    {
      date: "2024",
      title: "Design competition",
      body: "Second place nationally for a community library concept.",
    },
    {
      date: "2026",
      title: "Internship",
      body: "Six months drawing real buildings for real people.",
    },
    {
      date: "2027",
      title: "Thesis",
      body: "A housing study for Kibera, defended with distinction.",
    },
  ],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: true,
    gifts: false,
    calendar: true,
    map: true,
    music: false,
  },
  sectionsOrder: [
    "hero",
    "hosts",
    "event",
    "story",
    "gallery",
    "countdown",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Daniel graduates · 24 September 2027",
    description: "Celebrate Daniel's graduation with us.",
  },
})
