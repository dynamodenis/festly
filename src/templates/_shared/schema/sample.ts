import type { InvitationConfigBase } from "./base"

/** A complete, valid wedding config. Used by tests, the seed and dev pages. */
export const sampleInvitationConfig: InvitationConfigBase = {
  hosts: [
    {
      name: "Amara Wanjiku",
      shortName: "Amara",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Kamau",
    },
    {
      name: "Kofi Mensah",
      shortName: "Kofi",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Mensah",
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
    coverReveal: "envelope",
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    startAtSec: 0,
    loop: true,
  },
  texts: {
    coverTitle: "You are invited",
    coverButtonLabel: "Open invitation",
    headline: "Amara & Kofi",
    message:
      "With joy in our hearts, we invite you to celebrate the beginning of our forever.",
    dressCode: "Garden formal",
    rsvpPrompt: "Kindly let us know if you can join us.",
    rsvpDeadline: "2027-05-15T23:59:00+03:00",
    closing: "Your presence is the greatest gift.",
  },
  gallery: [
    {
      assetKey: "samples/amara-kofi-1.webp",
      url: "https://example.com/samples/amara-kofi-1.webp",
      width: 1600,
      height: 1067,
      alt: "Amara and Kofi laughing in a garden",
    },
  ],
  story: [
    {
      date: "2021",
      title: "We met",
      body: "A rainy afternoon, one umbrella and a long walk home.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [],
    ewallets: [
      { provider: "M-Pesa", holder: "Amara Wanjiku", number: "0700000000" },
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
    "closing",
  ],
  seo: {
    title: "Amara & Kofi · 12 June 2027",
    description: "Join us as we celebrate our wedding in Nairobi.",
  },
}
