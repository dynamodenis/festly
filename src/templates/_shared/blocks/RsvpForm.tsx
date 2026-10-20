import { useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatLongDate } from "@/lib/format-date"
import { useInvitation, type RsvpInput } from "../context"
import { Section, type BlockProps } from "./Section"
import { InvButton, inputClass } from "./ui"

export type RsvpVariant = "card" | "plain"

type RsvpFormProps = BlockProps & {
  variant?: RsvpVariant
}

const ATTENDING: Array<{ value: RsvpInput["attending"]; label: string }> = [
  { value: "yes", label: "Joyfully accept" },
  { value: "no", label: "Regretfully decline" },
  { value: "maybe", label: "Not sure yet" },
]

/**
 * RSVP form. Submits through `actions.submitRsvp` from context (wired by the
 * public page in Phase 6). In preview, or without an action, it explains that
 * responses are disabled instead of pretending to send.
 */
export function RsvpForm({
  variant = "card",
  eyebrow = "RSVP",
  title = "Will you join us?",
  tone,
  className,
}: RsvpFormProps) {
  const { config, mode, actions, guestName } = useInvitation()
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [attending, setAttending] = useState<RsvpInput["attending"]>("yes")
  const { texts, datetime } = config
  const disabled = mode === "preview" || !actions.submitRsvp

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || !actions.submitRsvp) {
      toast("Preview mode", {
        description: "RSVPs are disabled while previewing.",
      })
      return
    }
    const form = new FormData(event.currentTarget)
    const input: RsvpInput = {
      guestName: String(form.get("guestName") ?? "").trim(),
      attending,
      partySize: Number(form.get("partySize") ?? 1),
      message: String(form.get("message") ?? "").trim() || undefined,
      contact: String(form.get("contact") ?? "").trim() || undefined,
    }
    setStatus("sending")
    try {
      await actions.submitRsvp(input)
      setStatus("sent")
      toast("Thank you!", { description: "Your response has been recorded." })
    } catch (error) {
      setStatus("idle")
      toast.error("Could not send your RSVP", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    }
  }

  return (
    <Section
      id="rsvp"
      tone={tone}
      eyebrow={eyebrow}
      title={title}
      intro={texts.rsvpPrompt}
      width="narrow"
      className={className}
    >
      {status === "sent" ? (
        <p className="text-center font-inv-display text-2xl text-inv-primary">
          Thank you, we have your response.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          aria-describedby={disabled ? "rsvp-preview-note" : undefined}
          className={cn(
            "flex flex-col gap-5",
            variant === "card" &&
              "rounded-inv border border-inv-line bg-inv-surface p-6 sm:p-8"
          )}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="rsvp-name" className="text-sm font-medium">
              Your name
            </label>
            <input
              id="rsvp-name"
              name="guestName"
              required
              maxLength={120}
              autoComplete="name"
              defaultValue={guestName ?? ""}
              className={inputClass}
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">
              Will you attend?
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ATTENDING.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-inv border px-3 py-3 text-center text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inv-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-inv-bg",
                    attending === option.value
                      ? "border-inv-primary bg-inv-primary text-inv-bg"
                      : "border-inv-line hover:border-inv-primary/60"
                  )}
                >
                  <input
                    type="radio"
                    name="attending"
                    value={option.value}
                    checked={attending === option.value}
                    onChange={() => setAttending(option.value)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="rsvp-party" className="text-sm font-medium">
                Number of guests
              </label>
              <input
                id="rsvp-party"
                name="partySize"
                type="number"
                min={1}
                max={10}
                defaultValue={1}
                inputMode="numeric"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="rsvp-contact" className="text-sm font-medium">
                Phone or email{" "}
                <span className="text-inv-muted">(optional)</span>
              </label>
              <input
                id="rsvp-contact"
                name="contact"
                maxLength={120}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="rsvp-message" className="text-sm font-medium">
              A note for us <span className="text-inv-muted">(optional)</span>
            </label>
            <textarea
              id="rsvp-message"
              name="message"
              rows={3}
              maxLength={500}
              className={inputClass}
            />
          </div>

          <InvButton
            type="submit"
            size="lg"
            disabled={status === "sending"}
            className="self-center"
          >
            {status === "sending" ? "Sending…" : "Send RSVP"}
          </InvButton>

          {texts.rsvpDeadline && (
            <p className="text-center text-xs text-inv-muted">
              Please reply by{" "}
              {formatLongDate(texts.rsvpDeadline, datetime.timezone)}
            </p>
          )}
          {disabled && (
            <p
              id="rsvp-preview-note"
              className="text-center text-xs text-inv-muted"
            >
              Preview: responses are not recorded.
            </p>
          )}
        </form>
      )}
    </Section>
  )
}
