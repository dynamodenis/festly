import { z } from "zod"
import { InvitationConfigBase } from "../../_shared/schema"

/** Confetti Pop adds the age being celebrated; it is shown as the big number. */
export const schema = InvitationConfigBase.extend({
  age: z.int().min(1).max(150),
})
export type ConfettiPopConfig = z.infer<typeof schema>
