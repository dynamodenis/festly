import { MAX_DRESS_CODE_PHOTOS } from "@/templates/_shared/schema"
import { DateTimeField, Group, TextField } from "../fields"
import { ImageListField } from "../media"

export function TextsTab() {
  return (
    <>
      <Group title="Cover">
        <TextField
          path={["texts", "coverTitle"]}
          label="Cover line"
          maxLength={120}
          placeholder="You are invited"
        />
        <TextField
          path={["texts", "coverButtonLabel"]}
          label="Button"
          maxLength={40}
          placeholder="Open invitation"
        />
      </Group>
      <Group title="Main words">
        <TextField
          path={["texts", "headline"]}
          label="Headline"
          maxLength={160}
        />
        <TextField
          path={["texts", "message"]}
          label="Message"
          multiline
          rows={4}
          maxLength={2000}
        />
        <TextField
          path={["texts", "dressCode"]}
          label="Dress code"
          optional
          maxLength={200}
        />
        <ImageListField
          path={["texts", "dressCodePhotos"]}
          purpose="dresscode"
          label="Dress code photos"
          max={MAX_DRESS_CODE_PHOTOS}
          help="Optional outfit ideas or colour swatches for guests."
        />
      </Group>
      <Group title="RSVP">
        <TextField
          path={["texts", "rsvpPrompt"]}
          label="RSVP prompt"
          multiline
          rows={2}
          maxLength={300}
        />
        <DateTimeField
          path={["texts", "rsvpDeadline"]}
          label="Reply by"
          optional
        />
      </Group>
      <Group title="Ending">
        <TextField
          path={["texts", "closing"]}
          label="Closing words"
          multiline
          rows={2}
          maxLength={500}
        />
        <TextField
          path={["texts", "footerNote"]}
          label="Footer note"
          optional
          maxLength={300}
        />
      </Group>
      <Group
        title="Link preview"
        description="How the invitation looks when shared on WhatsApp and social apps."
      >
        <TextField
          path={["seo", "title"]}
          label="Title"
          optional
          maxLength={70}
        />
        <TextField
          path={["seo", "description"]}
          label="Description"
          optional
          multiline
          rows={2}
          maxLength={200}
        />
      </Group>
    </>
  )
}
