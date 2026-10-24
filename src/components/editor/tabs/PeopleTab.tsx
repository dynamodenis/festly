import { HostRole, type Host } from "@/templates/_shared/schema"
import { ListEditor } from "../ListEditor"
import { Group, SelectField, TextField } from "../fields"
import { ImageField } from "../media"

const ROLE_LABELS: Record<Host["role"], string> = {
  bride: "Bride",
  groom: "Groom",
  host: "Host",
  graduate: "Graduate",
  celebrant: "Celebrant",
  baby: "Baby",
  company: "Company",
  other: "Other",
}

export function PeopleTab() {
  return (
    <Group
      title="Who is celebrating"
      description="The couple, the birthday star, the graduate, or the hosting company."
    >
      <ListEditor<Host>
        path={["hosts"]}
        min={1}
        max={8}
        addLabel="Add person"
        itemLabel={(h, i) => h.name || `Person ${i + 1}`}
        create={() => ({ name: "New person", role: "host" })}
      >
        {(_, p) => (
          <>
            <TextField
              path={[...p, "name"]}
              label="Full name"
              maxLength={120}
            />
            <TextField
              path={[...p, "shortName"]}
              label="Short name"
              optional
              maxLength={40}
              help="Used in headlines, e.g. “Amara”."
            />
            <SelectField
              path={[...p, "role"]}
              label="Role"
              options={HostRole.options.map((v) => ({
                value: v,
                label: ROLE_LABELS[v],
              }))}
            />
            <TextField
              path={[...p, "parentsLine"]}
              label="Family line"
              optional
              maxLength={200}
              placeholder="Daughter of Mr. & Mrs. Kamau"
            />
            <ImageField
              path={[...p, "photo"]}
              purpose="portrait"
              label="Portrait"
              className="sm:col-span-2"
            />
          </>
        )}
      </ListEditor>
    </Group>
  )
}
