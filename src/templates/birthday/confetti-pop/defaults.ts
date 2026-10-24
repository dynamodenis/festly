import { schema, type ConfettiPopConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/900`,
  width: 1200,
  height: 900,
  alt,
})

export const defaults: ConfettiPopConfig = schema.parse({
  age: 7,
  hosts: [
    {
      name: "Zuri Achieng",
      shortName: "Zuri",
      role: "celebrant",
      parentsLine: "Hosted by Wanjiru & David",
      photo: photo("zuri", "Zuri grinning with a party hat"),
    },
  ],
  event: {
    type: "birthday",
    title: "Zuri is turning seven!",
    subtitle: "A confetti-filled afternoon",
    subEvents: [
      {
        label: "Games & face painting",
        start: "2027-03-20T14:00:00+03:00",
        end: "2027-03-20T15:30:00+03:00",
      },
      {
        label: "Cake!",
        start: "2027-03-20T15:30:00+03:00",
        end: "2027-03-20T16:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-03-20T14:00:00+03:00",
    end: "2027-03-20T17:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Karura Forest Picnic Lawn",
    address: "Limuru Road, Nairobi, Kenya",
    lat: -1.2405,
    lng: 36.8237,
    notes: "Look for the pink balloons by the main entrance.",
  },
  theme: {
    paletteId: "candy",
    fontPairId: "baloo-nunito",
    motionLevel: "full",
    envelope: { liner: "confetti", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "You're invited to",
    coverButtonLabel: "Let's party!",
    headline: "Zuri's Birthday Bash",
    message:
      "Bring your dancing shoes and your silliest face. There will be cake, games and far too much confetti.",
    dressCode: "Anything bright!",
    rsvpPrompt: "Let us know who is coming so we can bake enough cake.",
    rsvpDeadline: "2027-03-13T23:59:00+03:00",
    closing: "Can't wait to celebrate with you!",
    footerNote: "No gifts needed, just your smiles.",
  },
  gallery: [
    photo("pop1", "Zuri blowing bubbles"),
    photo("pop2", "Last year's cake"),
    photo("pop3", "Face painting fun"),
    photo("pop4", "Running through the sprinklers"),
  ],
  story: [],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: false,
    gifts: false,
    calendar: true,
    map: true,
    music: true,
  },
  sectionsOrder: [
    "hero",
    "countdown",
    "event",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Zuri turns 7 · 20 March 2027",
    description: "Join us for a confetti-filled birthday afternoon.",
  },
})
