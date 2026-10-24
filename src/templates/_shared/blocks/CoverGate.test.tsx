import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { deepMerge } from "@/lib/deep-merge"
import type { TemplateMode } from "../../types"
import { InvitationProvider } from "../context"
import { sampleInvitationConfig } from "../schema/sample"
import type { CoverReveal, MotionLevel } from "../schema"
import { CoverGate } from "./CoverGate"

// jsdom has no AnimationEvent. Without it react-dom (which checks once, at
// import) listens for `webkitAnimationEnd` instead, and test events carry no
// animationName. Hoisted so it exists before react-dom loads.
vi.hoisted(() => {
  if ("AnimationEvent" in globalThis) return
  class AnimationEvent extends Event {
    readonly animationName: string
    constructor(type: string, init: AnimationEventInit = {}) {
      super(type, init)
      this.animationName = init.animationName ?? ""
    }
  }
  Object.assign(globalThis, { AnimationEvent })
})

const LABEL = sampleInvitationConfig.texts.coverButtonLabel
const lock = () =>
  document.documentElement.classList.contains("inv-scroll-lock")
const cover = () => document.querySelector('[data-block="cover"]')

function setup({
  mode = "public",
  motion = "full",
  reveal,
  guestName,
}: {
  mode?: TemplateMode
  motion?: MotionLevel
  reveal?: CoverReveal
  guestName?: string
} = {}) {
  const config = deepMerge(sampleInvitationConfig, {
    theme: { motionLevel: motion },
  })
  render(
    <InvitationProvider config={config} mode={mode} guestName={guestName}>
      <CoverGate reveal={reveal} crest={<span data-testid="crest" />} />
      <div id="inv-content" tabIndex={-1} />
    </InvitationProvider>
  )
  return { button: screen.getByRole("button", { name: LABEL }) }
}

beforeEach(() => {
  vi.useFakeTimers()
  // jsdom has no layout, scrolling or media queries.
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
  window.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  // globals: false, so Testing Library cannot register its own cleanup.
  cleanup()
  vi.useRealTimers()
  document.documentElement.classList.remove("inv-scroll-lock")
})

describe("CoverGate envelope in public mode", () => {
  it("gates the page until opened", () => {
    const { button } = setup()
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true")
    expect(cover()).toHaveAttribute("data-state", "gated")
    expect(button).toHaveFocus()
    expect(lock()).toBe(true)
  })

  it("plays the opening, then removes itself and hands focus to the content", () => {
    const { button } = setup()
    fireEvent.click(button)

    expect(cover()).toHaveAttribute("data-state", "opening")
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(lock()).toBe(true)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 })

    act(() => vi.advanceTimersByTime(2399))
    expect(cover()).not.toBeNull()

    act(() => vi.advanceTimersByTime(1))
    expect(cover()).toBeNull()
    expect(lock()).toBe(false)
    expect(document.getElementById("inv-content")).toHaveFocus()
  })

  it("ignores taps while it is already opening", () => {
    const { button } = setup()
    fireEvent.click(button)
    act(() => vi.advanceTimersByTime(2000))
    fireEvent.click(button)
    act(() => vi.advanceTimersByTime(400))
    expect(cover()).toBeNull()
  })

  it("opens from a tap on the envelope itself", () => {
    setup()
    const envelope = document.querySelector(".inv-env")
    expect(envelope).not.toBeNull()
    fireEvent.click(envelope!)
    expect(cover()).toHaveAttribute("data-state", "opening")
  })

  it.each([
    ["reduced", 450],
    ["none", 0],
  ] as const)("is shorter at motion %s (%ims)", (motion, ms) => {
    const { button } = setup({ motion })
    fireEvent.click(button)
    if (ms > 0) {
      act(() => vi.advanceTimersByTime(ms - 1))
      expect(cover()).not.toBeNull()
    }
    act(() => vi.advanceTimersByTime(1))
    expect(cover()).toBeNull()
    expect(lock()).toBe(false)
  })

  it("addresses the envelope and presses the crest into the seal", () => {
    setup({ guestName: "Amina Otieno" })
    const envelope = document.querySelector(".inv-env")!
    expect(envelope).toHaveAttribute("aria-hidden", "true")
    expect(envelope).toHaveTextContent("Amina Otieno")
    expect(
      envelope.querySelector(".inv-env-seal [data-testid=crest]")
    ).not.toBeNull()
  })
})

describe("CoverGate envelope stationery", () => {
  const renderWith = (envelope: unknown) => {
    const config = deepMerge(sampleInvitationConfig, { theme: { envelope } })
    render(
      <InvitationProvider config={config} mode="preview">
        <CoverGate crest={<span data-testid="crest" />} />
      </InvitationProvider>
    )
    return document.querySelector(".inv-env")!
  }

  it("defaults to the original look: stripes, sticker, no stamp", () => {
    const envelope = renderWith(undefined)
    expect(envelope).toHaveAttribute("data-liner", "stripes")
    expect(envelope).toHaveAttribute("data-seal", "sticker")
    expect(envelope.querySelector(".inv-env-stamp")).toBeNull()
  })

  it("applies the chosen liner and seal", () => {
    const envelope = renderWith({ liner: "floral", seal: "wax", stamp: false })
    expect(envelope).toHaveAttribute("data-liner", "floral")
    expect(envelope).toHaveAttribute("data-seal", "wax")
    // Back and inside of the flap both carry the liner.
    expect(envelope.querySelectorAll(".inv-env-liner")).toHaveLength(2)
  })

  it("drops a letter photo that fails to load", () => {
    render(
      <InvitationProvider config={sampleInvitationConfig} mode="preview">
        <CoverGate imageUrl="https://example.com/missing.webp" />
      </InvitationProvider>
    )
    const letter = document.querySelector(".inv-env-letter")!
    fireEvent.error(letter.querySelector("img")!)
    expect(letter.querySelector("img")).toBeNull()
    expect(letter.querySelector(".inv-frame")).not.toBeNull()
  })

  it("puts the event date on the stamp", () => {
    const envelope = renderWith({
      liner: "stripes",
      seal: "sticker",
      stamp: true,
    })
    const stamp = envelope.querySelector(".inv-env-stamp")
    expect(stamp).not.toBeNull()
    // sampleInvitationConfig starts 12 June 2027 (Africa/Nairobi).
    expect(stamp).toHaveTextContent(/Jun\s*12\s*2027/)
  })
})

describe("CoverGate liner peek", () => {
  const view = (mode: TemplateMode, liner: string) => (
    <InvitationProvider
      config={deepMerge(sampleInvitationConfig, {
        theme: { envelope: { liner, seal: "sticker", stamp: false } },
      })}
      mode={mode}
    >
      <CoverGate />
    </InvitationProvider>
  )
  const envelope = () => document.querySelector(".inv-env")!

  it("lifts the flap in the editor preview when the liner changes", () => {
    const { rerender } = render(view("preview", "stripes"))
    expect(envelope()).not.toHaveAttribute("data-peek")
    rerender(view("preview", "dots"))
    expect(envelope()).toHaveAttribute("data-peek")
    expect(envelope()).toHaveAttribute("data-liner", "dots")
  })

  it("stops once the peek animation ends", () => {
    const { rerender } = render(view("preview", "stripes"))
    rerender(view("preview", "floral"))
    fireEvent.animationEnd(envelope().querySelector(".inv-env-flap")!, {
      animationName: "inv-env-peek-flap",
    })
    expect(envelope()).not.toHaveAttribute("data-peek")
  })

  it("is cut short by opening, so resealing does not replay it", () => {
    const { rerender } = render(view("preview", "stripes"))
    rerender(view("preview", "confetti"))
    fireEvent.click(screen.getByRole("button", { name: LABEL }))
    expect(envelope()).not.toHaveAttribute("data-peek")
    act(() => vi.advanceTimersByTime(2400))
    expect(cover()).toHaveAttribute("data-state", "inline")
    expect(envelope()).not.toHaveAttribute("data-peek")
  })

  it("never peeks for guests", () => {
    const { rerender } = render(view("public", "stripes"))
    rerender(view("public", "dots"))
    expect(envelope()).not.toHaveAttribute("data-peek")
  })
})

describe("CoverGate envelope in preview mode", () => {
  it("stays inline and never locks scrolling", () => {
    setup({ mode: "preview" })
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(cover()).toHaveAttribute("data-state", "inline")
    expect(lock()).toBe(false)
  })

  it("opens, jumps to the content, then reseals for a replay", () => {
    const { button } = setup({ mode: "preview" })
    fireEvent.click(button)
    expect(cover()).toHaveAttribute("data-state", "opening")
    expect(lock()).toBe(false)

    act(() => vi.advanceTimersByTime(2400))
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    })
    expect(cover()).toHaveAttribute("data-state", "inline")
  })
})

describe("CoverGate lift reveal", () => {
  it("follows the invitation's theme.coverReveal", () => {
    const config = deepMerge(sampleInvitationConfig, {
      theme: { coverReveal: "lift" },
    })
    render(
      <InvitationProvider config={config} mode="preview">
        <CoverGate />
      </InvitationProvider>
    )
    expect(cover()).toHaveAttribute("data-reveal", "lift")
    expect(document.querySelector(".inv-env")).toBeNull()
  })

  it("scrolls straight to the content in preview", () => {
    const { button } = setup({ mode: "preview", reveal: "lift" })
    expect(document.querySelector(".inv-env")).toBeNull()
    fireEvent.click(button)
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    })
    expect(cover()).toHaveAttribute("data-state", "inline")
  })

  it("slides away in public mode", () => {
    const { button } = setup({ reveal: "lift" })
    fireEvent.click(button)
    expect(cover()).toHaveClass("-translate-y-full")
    act(() => vi.advanceTimersByTime(850))
    expect(cover()).toBeNull()
  })
})
