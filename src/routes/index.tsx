import { createFileRoute } from "@tanstack/react-router"
import { LandingPage } from "@/components/landing/LandingPage"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Festly · Invitations your guests will never forget" },
      {
        name: "description",
        content:
          "Beautiful invitation websites for weddings, birthdays and every celebration, with RSVP, countdown, map, music and wishes built in.",
      },
      { name: "theme-color", content: "#110b07" },
    ],
  }),
  component: LandingPage,
})
