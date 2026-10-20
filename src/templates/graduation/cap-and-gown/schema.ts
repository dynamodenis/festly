import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Cap & Gown adds the academic details shown under the headline. */
export const schema = InvitationConfigBase.extend({
  graduation: z.object({
    school: z.string().trim().min(1).max(160),
    degree: z.string().trim().max(160).optional(),
    classOf: z.int().min(1900).max(2200),
  }),
})
export type CapAndGownConfig = z.infer<typeof schema>
