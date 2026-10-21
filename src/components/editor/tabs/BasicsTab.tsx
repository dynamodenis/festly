import { EventType } from "@/templates/_shared/schema"
import { useEditor } from "../EditorContext"
import {
  DateTimeField,
  Group,
  NumberField,
  SelectField,
  TextField,
} from "../fields"
import { timeZones } from "@/lib/zoned-time"

const EVENT_LABELS: Record<EventType, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  graduation: "Graduation",
  baby_shower: "Baby shower",
  anniversary: "Anniversary",
  corporate: "Corporate",
  engagement: "Engagement",
  khitanan: "Khitanan",
  aqiqah: "Aqiqah",
  other: "Other",
}

export function BasicsTab() {
  const { module } = useEditor()
  const zones = timeZones().map((z) => ({
    value: z,
    label: z.replaceAll("_", " "),
  }))
  return (
    <>
      <Group title="The occasion">
        <SelectField
          path={["event", "type"]}
          label="Type of event"
          options={EventType.options.map((v) => ({
            value: v,
            label: EVENT_LABELS[v],
          }))}
        />
        <TextField
          path={["event", "title"]}
          label="Event title"
          placeholder="The Wedding of Amara & Kofi"
          maxLength={120}
        />
        <TextField
          path={["event", "subtitle"]}
          label="Subtitle"
          optional
          placeholder="Together with their families"
          maxLength={200}
        />
      </Group>
      <Group
        title="Date & time"
        description="Shown in the event's own time zone, wherever guests are."
      >
        <SelectField
          path={["datetime", "timezone"]}
          label="Time zone"
          options={zones}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <DateTimeField path={["datetime", "start"]} label="Starts" />
          <DateTimeField path={["datetime", "end"]} label="Ends" optional />
        </div>
      </Group>
      {module.fieldsUi && module.fieldsUi.length > 0 && (
        <Group
          title={`${module.meta.name} details`}
          description="Extra fields this template shows."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {module.fieldsUi.map((field) =>
              field.type === "number" ? (
                <NumberField
                  key={field.path.join(".")}
                  path={field.path}
                  label={field.label}
                  help={field.help}
                  min={field.min}
                  max={field.max}
                />
              ) : (
                <TextField
                  key={field.path.join(".")}
                  path={field.path}
                  label={field.label}
                  help={field.help}
                  placeholder={field.placeholder}
                  multiline={field.type === "textarea"}
                />
              )
            )}
          </div>
        </Group>
      )}
    </>
  )
}
