import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import { ORNAMENTS, type OrnamentKind, type TemplateMode } from "../types"
import type { InvitationConfigBase } from "./schema"
import { resolvePalette, type Palette } from "./theme/palettes"
import { useEffectiveMotion, type EffectiveMotion } from "./theme/motion"

export type RsvpInput = {
  guestName: string
  attending: "yes" | "no" | "maybe"
  partySize: number
  message?: string
  contact?: string
}

export type WishInput = { name: string; message: string }

export type WishItem = {
  id: string
  name: string
  message: string
  createdAt: string
}

/**
 * Server-side actions the public page injects (Phase 6). When absent, or in
 * preview mode, forms stay interactive but explain they are disabled.
 */
export type InvitationActions = {
  submitRsvp?: (input: RsvpInput) => Promise<void>
  submitWish?: (input: WishInput) => Promise<WishItem>
}

export type InvitationContextValue = {
  config: InvitationConfigBase
  mode: TemplateMode
  motion: EffectiveMotion
  palette: Palette
  /** Divider style: `theme.ornament` when valid, else the template default. */
  ornament: OrnamentKind
  /** Published slug; enables `/ics/$slug` links. */
  slug?: string
  /** "Dear {guestName}" on the cover (sanitized by the caller). */
  guestName?: string
  wishes: ReadonlyArray<WishItem>
  actions: InvitationActions
  /** True once the guest tapped through the cover. */
  opened: boolean
  open: () => void
}

const InvitationContext = createContext<InvitationContextValue | null>(null)

// Module-level so omitted props do not create new identities every render
// (which would invalidate the context value and re-render every block).
const NO_WISHES: ReadonlyArray<WishItem> = []
const NO_ACTIONS: InvitationActions = {}

const isOrnament = (value: string | undefined): value is OrnamentKind =>
  (ORNAMENTS as ReadonlyArray<string | undefined>).includes(value)

export function resolveOrnament(
  configured: string | undefined,
  fallback: OrnamentKind = "line"
): OrnamentKind {
  return isOrnament(configured) ? configured : fallback
}

export type InvitationProviderProps = {
  config: InvitationConfigBase
  mode: TemplateMode
  slug?: string
  guestName?: string
  wishes?: ReadonlyArray<WishItem>
  actions?: InvitationActions
  /** The template's default ornament (meta.ornament). */
  ornament?: OrnamentKind
  children: ReactNode
}

export function InvitationProvider({
  config,
  mode,
  slug,
  guestName,
  wishes = NO_WISHES,
  actions = NO_ACTIONS,
  ornament: defaultOrnament,
  children,
}: InvitationProviderProps) {
  const motion = useEffectiveMotion(config.theme.motionLevel)
  const [opened, setOpened] = useState(false)
  const open = useCallback(() => setOpened(true), [])
  const palette = useMemo(() => resolvePalette(config.theme), [config.theme])
  const ornament = resolveOrnament(config.theme.ornament, defaultOrnament)

  const value = useMemo<InvitationContextValue>(
    () => ({
      config,
      mode,
      motion,
      palette,
      ornament,
      slug,
      guestName,
      wishes,
      actions,
      opened,
      open,
    }),
    [
      config,
      mode,
      motion,
      palette,
      ornament,
      slug,
      guestName,
      wishes,
      actions,
      opened,
      open,
    ]
  )

  return (
    <InvitationContext.Provider value={value}>
      {children}
    </InvitationContext.Provider>
  )
}

export function useInvitation(): InvitationContextValue {
  const ctx = useContext(InvitationContext)
  if (!ctx) {
    throw new Error("useInvitation must be used inside <InvitationProvider>")
  }
  return ctx
}
