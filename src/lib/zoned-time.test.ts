import { describe, expect, it } from "vitest"
import { fromZonedInput, toZonedInput, zoneOffsetMinutes } from "./zoned-time"

describe("zoned time", () => {
  it("shows event-local wall time", () => {
    expect(toZonedInput("2027-06-12T15:00:00+03:00", "Africa/Nairobi")).toBe(
      "2027-06-12T15:00"
    )
    expect(toZonedInput("2027-06-12T12:00:00Z", "America/New_York")).toBe(
      "2027-06-12T08:00"
    )
  })

  it("round-trips with the right offset, including DST", () => {
    expect(fromZonedInput("2027-06-12T15:00", "Africa/Nairobi")).toBe(
      "2027-06-12T15:00:00+03:00"
    )
    expect(fromZonedInput("2027-01-15T10:30", "America/New_York")).toBe(
      "2027-01-15T10:30:00-05:00"
    )
    expect(fromZonedInput("2027-07-15T10:30", "America/New_York")).toBe(
      "2027-07-15T10:30:00-04:00"
    )
    expect(fromZonedInput("2027-03-01T09:00", "Asia/Kolkata")).toBe(
      "2027-03-01T09:00:00+05:30"
    )
    const iso = fromZonedInput("2027-11-07T18:45", "Europe/London")!
    expect(toZonedInput(iso, "Europe/London")).toBe("2027-11-07T18:45")
  })

  it("rejects malformed input", () => {
    expect(fromZonedInput("tomorrow", "UTC")).toBeNull()
    expect(toZonedInput("nope", "UTC")).toBe("")
    expect(zoneOffsetMinutes("UTC", Date.UTC(2027, 0, 1))).toBe(0)
  })
})
