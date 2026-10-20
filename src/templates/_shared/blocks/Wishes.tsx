import { useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useInvitation, type WishItem } from "../context"
import { Section, type BlockProps } from "./Section"
import { InvButton, inputClass } from "./ui"
import { initials } from "./hosts"

export type WishesVariant = "cards" | "stream"

type WishesProps = BlockProps & {
  variant?: WishesVariant
}

/** Guest book: a short form plus the approved wishes passed in via context. */
export function Wishes({
  variant = "cards",
  eyebrow = "Wishes",
  title = "Leave a message",
  tone,
  className,
}: WishesProps) {
  const { mode, actions, wishes, guestName } = useInvitation()
  const [local, setLocal] = useState<Array<WishItem>>([])
  const [sending, setSending] = useState(false)
  const disabled = mode === "preview" || !actions.submitWish
  const all = [...local, ...wishes]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || !actions.submitWish) {
      toast("Preview mode", {
        description: "Wishes are disabled while previewing.",
      })
      return
    }
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    setSending(true)
    try {
      const wish = await actions.submitWish({
        name: String(form.get("name") ?? "").trim(),
        message: String(form.get("message") ?? "").trim(),
      })
      setLocal((prev) => [wish, ...prev])
      formEl.reset()
      toast("Thank you for your wishes!")
    } catch (error) {
      toast.error("Could not send your wish", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Section
      id="wishes"
      tone={tone}
      eyebrow={eyebrow}
      title={title}
      width="narrow"
      className={className}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="wish-name" className="sr-only">
          Your name
        </label>
        <input
          id="wish-name"
          name="name"
          required
          maxLength={80}
          placeholder="Your name"
          defaultValue={guestName ?? ""}
          className={inputClass}
        />
        <label htmlFor="wish-message" className="sr-only">
          Your message
        </label>
        <textarea
          id="wish-message"
          name="message"
          required
          rows={3}
          maxLength={500}
          placeholder="Write your wishes…"
          className={inputClass}
        />
        <InvButton
          type="submit"
          variant="outline"
          disabled={sending}
          className="self-end"
        >
          {sending ? "Sending…" : "Send wishes"}
        </InvButton>
        {disabled && (
          <p className="text-center text-xs text-inv-muted">
            Preview: wishes are not recorded.
          </p>
        )}
      </form>

      {all.length > 0 && (
        <ul
          className={cn(
            "mt-10 flex flex-col gap-4",
            variant === "cards" && "sm:grid sm:grid-cols-2"
          )}
        >
          {all.map((wish) => (
            <li
              key={wish.id}
              className={cn(
                "flex gap-3",
                variant === "cards" &&
                  "rounded-inv border border-inv-line bg-inv-surface p-4"
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-inv-secondary text-xs font-medium text-inv-primary"
              >
                {initials(wish.name)}
              </span>
              <div>
                <p className="text-sm font-medium">{wish.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-inv-muted">
                  {wish.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
