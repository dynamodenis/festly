import { describe, expect, it } from "vitest"
import { parsePublicEnv } from "./env.public"
import { parseServerEnv } from "./env.server"

describe("server env", () => {
  it("applies defaults when nothing is set", () => {
    const env = parseServerEnv({})
    expect(env.NODE_ENV).toBe("development")
    expect(env.APP_ORIGIN).toBe("http://localhost:3000")
    expect(env.GEOCODE_CONTACT_EMAIL).toBeUndefined()
    expect(env.DATABASE_URL).toBeUndefined()
  })

  it("accepts only postgres database URLs", () => {
    expect(
      parseServerEnv({
        DATABASE_URL:
          "postgresql://user:pw@ep-x-pooler.eu-central-1.aws.neon.tech/festly?sslmode=require",
      }).DATABASE_URL
    ).toContain("neon.tech")
    expect(() =>
      parseServerEnv({ DATABASE_URL: "mysql://localhost/festly" })
    ).toThrow(/DATABASE_URL/)
  })

  it("rejects a malformed origin or email", () => {
    expect(() => parseServerEnv({ APP_ORIGIN: "not a url" })).toThrow(
      /APP_ORIGIN/
    )
    expect(() => parseServerEnv({ GEOCODE_CONTACT_EMAIL: "nope" })).toThrow(
      /GEOCODE_CONTACT_EMAIL/
    )
  })
})

describe("public env", () => {
  it("parses boolean-ish flags", () => {
    expect(parsePublicEnv({}).VITE_ENABLE_DEV_ROUTES).toBe(false)
    expect(
      parsePublicEnv({ VITE_ENABLE_DEV_ROUTES: "1" }).VITE_ENABLE_DEV_ROUTES
    ).toBe(true)
    expect(parsePublicEnv({}).VITE_APP_NAME).toBe("Festly")
  })
})

describe("parseServerEnv blank values", () => {
  it("treats empty strings from .env as unset", () => {
    const env = parseServerEnv({
      NODE_ENV: "development",
      DATABASE_URL: "",
      GEOCODE_CONTACT_EMAIL: "",
      R2_ACCOUNT_ID: "",
      R2_PUBLIC_URL: "",
    })
    expect(env.DATABASE_URL).toBeUndefined()
    expect(env.GEOCODE_CONTACT_EMAIL).toBeUndefined()
    expect(env.R2_ACCOUNT_ID).toBeUndefined()
  })
})
