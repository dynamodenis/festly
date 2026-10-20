import type { Host } from "../schema"

export const ROLE_LABEL: Record<Host["role"], string> = {
  bride: "The Bride",
  groom: "The Groom",
  host: "Your Host",
  graduate: "The Graduate",
  celebrant: "The Celebrant",
  baby: "The Little One",
  company: "Hosted by",
  other: "",
}

/** "Amara & Kofi" from short names (falls back to full names). */
export function hostNames(hosts: ReadonlyArray<Host>, joiner = " & "): string {
  return hosts.map((h) => h.shortName ?? h.name).join(joiner)
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}
