import { Suspense, lazy, useMemo } from "react"
import type { ComponentType, LazyExoticComponent } from "react"
import { InvitationProvider } from "./_shared/context"
import type { InvitationActions, WishItem } from "./_shared/context"
import { ThemeScope } from "./_shared/theme/ThemeScope"
import { TEMPLATE_IDS, loadTemplate } from "./registry"
import { resolveConfig } from "./resolve-config"
import { TemplateRendererSkeleton } from "./TemplateRendererSkeleton"
import type { TemplateMode, TemplateModule } from "./types"

export type TemplateViewProps = {
  /** Anything: a DB row, a draft, an older shape. Validated before render. */
  config: unknown
  mode: TemplateMode
  slug?: string
  guestName?: string
  wishes?: ReadonlyArray<WishItem>
  actions?: InvitationActions
}

/**
 * Synchronous renderer for an already-loaded module: validate, theme, render.
 * Exported for SSR tests; pages use `TemplateRenderer`.
 */
export function TemplateView({
  module,
  config,
  mode,
  slug,
  guestName,
  wishes,
  actions,
}: TemplateViewProps & { module: TemplateModule }) {
  const resolved = useMemo(
    () => resolveConfig(module, config),
    [module, config]
  )
  const Component = module.Component
  return (
    <InvitationProvider
      config={resolved.config}
      mode={mode}
      slug={slug}
      guestName={guestName}
      wishes={wishes}
      actions={actions}
      ornament={module.meta.ornament}
    >
      <ThemeScope
        theme={resolved.config.theme}
        radius={module.meta.radius}
        grain={module.meta.grain}
      >
        <Component config={resolved.config} mode={mode} />
      </ThemeScope>
    </InvitationProvider>
  )
}

type LazyView = LazyExoticComponent<ComponentType<TemplateViewProps>>

// Built once at module load so the lazy component identity is stable.
const views: Partial<Record<string, LazyView>> = {}
for (const id of TEMPLATE_IDS) {
  views[id] = lazy(async () => {
    const module = await loadTemplate(id)
    const View = (props: TemplateViewProps) => (
      <TemplateView module={module} {...props} />
    )
    View.displayName = `TemplateView(${id})`
    return { default: View }
  })
}

export type TemplateRendererProps = TemplateViewProps & { templateId: string }

/**
 * Lazy-loads the template chunk for `templateId` and renders it. Shows the
 * skeleton while the chunk loads and a plain message for unknown ids.
 */
export function TemplateRenderer({
  templateId,
  ...props
}: TemplateRendererProps) {
  const View = views[templateId]
  if (!View) {
    return (
      <div role="alert" className="mx-auto max-w-md p-10 text-center">
        <p className="text-lg font-medium">This template is unavailable.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Unknown template id: <code>{templateId}</code>
        </p>
      </div>
    )
  }
  return (
    <Suspense fallback={<TemplateRendererSkeleton />}>
      <View {...props} />
    </Suspense>
  )
}
