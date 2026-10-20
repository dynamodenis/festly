import { useState } from "react"
import { Copy, ExternalLink, Gift } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useInvitation } from "../context"
import { Section, type BlockProps } from "./Section"
import { InvButton, InvLink } from "./ui"

export type GiftVariant = "envelope" | "cards"

type GiftEnvelopeProps = BlockProps & {
  variant?: GiftVariant
  intro?: string
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast("Copied", { description: text })
  } catch {
    toast.error("Could not copy. Please copy it manually.")
  }
}

/** Bank accounts, e-wallets, a QR code and registry links behind an "open envelope" button. */
export function GiftEnvelope({
  variant = "envelope",
  eyebrow = "Gifts",
  title = "A gift of love",
  intro = "Your presence is enough. If you wish to send a gift, here are a few ways.",
  tone,
  className,
}: GiftEnvelopeProps) {
  const { config } = useInvitation()
  const { gifts } = config
  const [open, setOpen] = useState(variant === "cards")
  const entries = [
    ...gifts.accounts.map((a) => ({
      label: a.bank,
      holder: a.holder,
      number: a.number,
    })),
    ...gifts.ewallets.map((e) => ({
      label: e.provider,
      holder: e.holder,
      number: e.number,
    })),
  ]

  return (
    <Section
      id="gifts"
      tone={tone}
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      width="narrow"
      className={className}
    >
      {!open ? (
        <div className="flex justify-center">
          <InvButton
            size="lg"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            aria-controls="gift-details"
          >
            <Gift className="size-4" aria-hidden="true" />
            Open envelope
          </InvButton>
        </div>
      ) : (
        <div id="gift-details" className="flex flex-col gap-6">
          {entries.length > 0 && (
            <ul
              className={cn(
                "grid gap-4",
                entries.length > 1 && "sm:grid-cols-2"
              )}
            >
              {entries.map((entry) => (
                <li
                  key={entry.label + entry.number}
                  className="flex flex-col gap-1 rounded-inv border border-inv-line bg-inv-surface p-5"
                >
                  <p className="text-xs tracking-[0.2em] text-inv-primary uppercase">
                    {entry.label}
                  </p>
                  <p className="font-inv-display text-xl tabular-nums">
                    {entry.number}
                  </p>
                  <p className="text-sm text-inv-muted">{entry.holder}</p>
                  <InvButton
                    variant="ghost"
                    size="sm"
                    className="mt-2 self-start"
                    onClick={() => copy(entry.number)}
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                    Copy number
                  </InvButton>
                </li>
              ))}
            </ul>
          )}
          {gifts.qrImage && (
            <figure className="flex flex-col items-center gap-2">
              <img
                src={gifts.qrImage.url}
                alt={gifts.qrImage.alt ?? "Payment QR code"}
                width={gifts.qrImage.width}
                height={gifts.qrImage.height}
                loading="lazy"
                className="size-48 rounded-inv bg-white p-2"
              />
              <figcaption className="text-xs text-inv-muted">
                Scan to send a gift
              </figcaption>
            </figure>
          )}
          {gifts.registryLinks.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2">
              {gifts.registryLinks.map((link) => (
                <li key={link.url}>
                  <InvLink
                    href={link.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    variant="outline"
                    size="sm"
                  >
                    {link.label}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </InvLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Section>
  )
}
