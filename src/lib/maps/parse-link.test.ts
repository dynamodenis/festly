import { describe, expect, it } from "vitest"
import { isShortMapLink, parseMapLink } from "./parse-link"

describe("parseMapLink", () => {
  it("prefers the exact pin over the viewport", () => {
    const url =
      "https://www.google.com/maps/place/The+Old+Mill+Gardens/@-1.22,36.80,17z/data=!3m1!4b1!4m6!3m5!1s0x0:0x0!8m2!3d-1.2195!4d36.8073"
    expect(parseMapLink(url)).toEqual({
      lat: -1.2195,
      lng: 36.8073,
      placeName: "The Old Mill Gardens",
    })
  })

  it("reads the viewport, query and OSM formats", () => {
    expect(
      parseMapLink("https://www.google.com/maps/@40.7128,-74.006,15z")
    ).toEqual({ lat: 40.7128, lng: -74.006 })
    expect(parseMapLink("https://maps.google.com/?q=51.5007,-0.1246")).toEqual({
      lat: 51.5007,
      lng: -0.1246,
    })
    expect(
      parseMapLink(
        "https://www.google.com/maps/dir/?api=1&destination=48.8584%2C2.2945"
      )
    ).toEqual({
      lat: 48.8584,
      lng: 2.2945,
    })
    expect(
      parseMapLink(
        "https://www.openstreetmap.org/?mlat=-1.29&mlon=36.82#map=16/-1.29/36.82"
      )
    ).toEqual({
      lat: -1.29,
      lng: 36.82,
    })
    expect(parseMapLink("-1.2195, 36.8073")).toEqual({
      lat: -1.2195,
      lng: 36.8073,
    })
  })

  it("returns null for links without coordinates or out-of-range values", () => {
    expect(
      parseMapLink("https://www.google.com/maps/search/old+mill")
    ).toBeNull()
    expect(parseMapLink("https://maps.google.com/?q=95,10")).toBeNull()
    expect(parseMapLink("not a link")).toBeNull()
  })

  it("recognizes short links that need server expansion", () => {
    expect(isShortMapLink("https://maps.app.goo.gl/AbCdEf123")).toBe(true)
    expect(isShortMapLink("https://goo.gl/maps/xyz")).toBe(true)
    expect(isShortMapLink("https://goo.gl/other")).toBe(false)
    expect(isShortMapLink("https://evil.example/maps.app.goo.gl")).toBe(false)
  })
})
