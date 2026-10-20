import { describe, expect, it } from "vitest"
import { googleCalendarUrl, icsPath, toUtcStamp } from "./calendar"

describe("calendar links", () => {
  it("converts offsets to UTC stamps", () => {
    expect(toUtcStamp("2027-06-12T15:00:00+03:00")).toBe("20270612T120000Z")
  })

  it("builds a Google Calendar template link", () => {
    const url = new URL(
      googleCalendarUrl({
        title: "Amara & Kofi",
        start: "2027-06-12T15:00:00+03:00",
        end: "2027-06-12T23:00:00+03:00",
        timezone: "Africa/Nairobi",
        location: "Limuru Road, Nairobi",
      })
    )
    expect(url.hostname).toBe("calendar.google.com")
    expect(url.searchParams.get("dates")).toBe(
      "20270612T120000Z/20270612T200000Z"
    )
    expect(url.searchParams.get("ctz")).toBe("Africa/Nairobi")
    expect(url.searchParams.get("location")).toBe("Limuru Road, Nairobi")
  })

  it("defaults the end to two hours after start", () => {
    const url = new URL(
      googleCalendarUrl({
        title: "x",
        start: "2027-06-12T15:00:00+03:00",
        timezone: "UTC",
      })
    )
    expect(url.searchParams.get("dates")).toBe(
      "20270612T120000Z/20270612T140000Z"
    )
  })

  it("encodes the ics slug", () => {
    expect(icsPath("amara-and-kofi")).toBe("/ics/amara-and-kofi")
  })
})
