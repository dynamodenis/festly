import { createContext, useContext } from "react"
import type { Path } from "@/lib/set-in"
import type { InvitationConfigBase } from "@/templates/_shared/schema"
import type { TemplateModule } from "@/templates/types"
import type { UploadedAudio, UploadedImage } from "./useUploader"

export type EditorConfig = InvitationConfigBase & Record<string, unknown>

export type EditorApi = {
  invitationId: string
  module: TemplateModule
  config: EditorConfig
  set: (path: Path, value: unknown) => void
  /** First validation message at exactly this path. */
  issue: (path: Path) => string | undefined
  /** How many issues live under this path prefix (for tab badges). */
  issueCount: (prefix: Path) => number
  uploadImage: (file: File) => Promise<UploadedImage>
  uploadAudio: (file: File) => Promise<UploadedAudio>
}

export const EditorContext = createContext<EditorApi | null>(null)

export function useEditor(): EditorApi {
  const ctx = useContext(EditorContext)
  if (!ctx) throw new Error("useEditor must be used inside the editor")
  return ctx
}
