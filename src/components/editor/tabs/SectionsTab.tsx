import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  FEATURE_FOR,
  isSectionEnabled,
} from "@/templates/_shared/blocks/Sections"
import { SectionId } from "@/templates/_shared/schema"
import { useEditor } from "../EditorContext"
import { SortableList } from "../Sortable"
import { Group } from "../fields"

export const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Opening",
  hosts: "People",
  event: "Programme",
  countdown: "Countdown",
  story: "Story",
  gallery: "Gallery",
  map: "Map",
  rsvp: "RSVP",
  wishes: "Wishes",
  gifts: "Gifts",
  calendar: "Add to calendar",
  closing: "Closing & footer",
}

export function SectionsTab() {
  const { config, set } = useEditor()
  const order = config.sectionsOrder
  const missing = SectionId.options.filter((id) => !order.includes(id))

  const toggle = (id: SectionId, on: boolean) => {
    const flag = FEATURE_FOR[id]
    if (flag) return set(["features", flag], on)
    if (!on && order.length > 1)
      set(
        ["sectionsOrder"],
        order.filter((s) => s !== id)
      )
  }

  return (
    <>
      <Group
        title="Order & visibility"
        description="Drag to reorder. Switch off what you do not need."
      >
        <SortableList
          items={order}
          getId={(id) => id}
          onReorder={(next) => set(["sectionsOrder"], next)}
          className="flex flex-col gap-2"
        >
          {(id, handle) => {
            const flag = FEATURE_FOR[id]
            const on = flag ? config.features[flag] : true
            const shown = isSectionEnabled(id, config)
            return (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                {handle}
                <div className="flex-1">
                  <p className="text-sm font-medium">{SECTION_LABELS[id]}</p>
                  {on && !shown && (
                    <p className="text-xs text-amber-300">
                      On, but empty: add content for it to appear.
                    </p>
                  )}
                </div>
                <Switch
                  checked={on}
                  onCheckedChange={(v) => toggle(id, v)}
                  aria-label={`Show ${SECTION_LABELS[id]}`}
                  disabled={!flag && order.length <= 1}
                />
              </div>
            )
          }}
        </SortableList>
      </Group>
      {missing.length > 0 && (
        <Group title="Add a section">
          <div className="flex flex-wrap gap-2">
            {missing.map((id) => (
              <Button
                key={id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set(["sectionsOrder"], [...order, id])}
              >
                <Plus aria-hidden="true" /> {SECTION_LABELS[id]}
              </Button>
            ))}
          </div>
        </Group>
      )}
    </>
  )
}
