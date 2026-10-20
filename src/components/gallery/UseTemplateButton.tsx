import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { brandButton } from "@/components/brand/ButtonLink"
import { cn } from "@/lib/utils"
import { createDraftFn } from "@/server/invitations/invitations.functions"

/** "Use this template": creates a draft (with the chosen palette) and opens the editor. */
export function UseTemplateButton({
  templateId,
  paletteId,
  className,
}: {
  templateId: string
  paletteId: string
  className?: string
}) {
  const createDraft = useServerFn(createDraftFn)
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  const onClick = async () => {
    setPending(true)
    try {
      const { id } = await createDraft({ data: { templateId, paletteId } })
      await navigate({
        to: "/editor/$invitationId",
        params: { invitationId: id },
      })
    } catch (error) {
      setPending(false)
      toast.error("Could not start your invitation", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className={cn(
        brandButton({ size: "lg" }),
        "w-full disabled:cursor-wait disabled:opacity-80",
        className
      )}
    >
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Creating your draft…
        </>
      ) : (
        <>
          Use this template
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </>
      )}
    </button>
  )
}
