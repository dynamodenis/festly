import { InvitationConfigBase } from "../../_shared/schema"

/** Ivory Garden uses the shared config unchanged. */
export const schema = InvitationConfigBase
export type IvoryGardenConfig = typeof schema extends {
  parse: (v: unknown) => infer T
}
  ? T
  : never
