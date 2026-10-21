import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { getIn, type Path } from "@/lib/set-in"
import { useEditor } from "./EditorContext"

type ListEditorProps<T> = {
  path: Path
  /** Shown on each card, e.g. "Host 1". */
  itemLabel: (item: T, index: number) => string
  /** New item when "Add" is pressed. */
  create: () => T
  addLabel: string
  min?: number
  max?: number
  children: (index: number, itemPath: Path) => ReactNode
}

/** Repeating group with add / remove / move (keyboard-friendly reordering). */
export function ListEditor<T>({
  path,
  itemLabel,
  create,
  addLabel,
  min = 0,
  max = 50,
  children,
}: ListEditorProps<T>) {
  const { config, set } = useEditor()
  const items = (getIn(config, path) as Array<T> | undefined) ?? []

  const move = (from: number, to: number) => {
    const next = [...items]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    set(path, next)
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-xl border border-border bg-card/50 p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-medium tracking-[0.15em] text-primary uppercase">
              {itemLabel(item, index)}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Move down"
                disabled={index === items.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`Remove ${itemLabel(item, index)}`}
                disabled={items.length <= min}
                onClick={() =>
                  set(
                    path,
                    items.filter((_, i) => i !== index)
                  )
                }
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {children(index, [...path, index])}
          </div>
        </div>
      ))}
      {items.length < max && (
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => set(path, [...items, create()])}
        >
          <Plus aria-hidden="true" /> {addLabel}
        </Button>
      )}
    </div>
  )
}
