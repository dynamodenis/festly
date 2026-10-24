import type { StoryItem } from "@/templates/_shared/schema"
import { ListEditor } from "../ListEditor"
import { Group, TextField, ToggleField } from "../fields"
import { ImageField } from "../media"

export function StoryTab() {
  return (
    <Group
      title="Story"
      description="Milestones in order: how you met, the proposal, the thesis."
    >
      <ToggleField path={["features", "story"]} label="Show story" />
      <ListEditor<StoryItem>
        path={["story"]}
        max={20}
        addLabel="Add moment"
        itemLabel={(s, i) => s.title || `Moment ${i + 1}`}
        create={() => ({
          title: "A new chapter",
          body: "Tell guests what happened.",
        })}
      >
        {(_, p) => (
          <>
            <TextField
              path={[...p, "date"]}
              label="When"
              optional
              maxLength={60}
              placeholder="2021"
            />
            <TextField path={[...p, "title"]} label="Title" maxLength={120} />
            <TextField
              path={[...p, "body"]}
              label="What happened"
              multiline
              rows={3}
              maxLength={1500}
              className="sm:col-span-2"
            />
            <ImageField
              path={[...p, "photo"]}
              purpose="story"
              label="Photo"
              className="sm:col-span-2"
            />
          </>
        )}
      </ListEditor>
    </Group>
  )
}
