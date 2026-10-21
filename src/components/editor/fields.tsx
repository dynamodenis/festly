import { useId } from "react"
import type { ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getIn, type Path } from "@/lib/set-in"
import { cn } from "@/lib/utils"
import { fromZonedInput, toZonedInput } from "@/lib/zoned-time"
import { useEditor } from "./EditorContext"

type ShellProps = {
  id: string
  label: string
  help?: string
  error?: string
  optional?: boolean
  className?: string
  children: ReactNode
}

/** Label + control + help + error, wired with aria attributes. */
export function FieldShell({
  id,
  label,
  help,
  error,
  optional,
  className,
  children,
}: ShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {optional && (
          <span className="ml-1 font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </label>
      {children}
      {help && !error && (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

const described = (id: string, help?: string, error?: string) =>
  error ? `${id}-error` : help ? `${id}-help` : undefined

type TextProps = {
  path: Path
  label: string
  help?: string
  placeholder?: string
  optional?: boolean
  multiline?: boolean
  rows?: number
  maxLength?: number
  type?: "text" | "url" | "email" | "tel"
  className?: string
}

export function TextField({
  path,
  label,
  help,
  placeholder,
  optional,
  multiline,
  rows = 3,
  maxLength,
  type = "text",
  className,
}: TextProps) {
  const { config, set, issue } = useEditor()
  const id = useId()
  const value = (getIn(config, path) as string | undefined) ?? ""
  const error = issue(path)
  const onChange = (next: string) =>
    set(path, optional && next.trim() === "" ? undefined : next)
  const common = {
    id,
    value,
    placeholder,
    maxLength,
    "aria-invalid": !!error,
    "aria-describedby": described(id, help, error),
  }
  return (
    <FieldShell
      id={id}
      label={label}
      help={help}
      error={error}
      optional={optional}
      className={className}
    >
      {multiline ? (
        <Textarea
          {...common}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          {...common}
          type={type}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </FieldShell>
  )
}

export function NumberField({
  path,
  label,
  help,
  min,
  max,
  step,
  optional,
  className,
}: {
  path: Path
  label: string
  help?: string
  min?: number
  max?: number
  step?: number | "any"
  optional?: boolean
  className?: string
}) {
  const { config, set, issue } = useEditor()
  const id = useId()
  const raw = getIn(config, path)
  const error = issue(path)
  return (
    <FieldShell
      id={id}
      label={label}
      help={help}
      error={error}
      optional={optional}
      className={className}
    >
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={typeof raw === "number" ? raw : ""}
        aria-invalid={!!error}
        aria-describedby={described(id, help, error)}
        onChange={(e) =>
          set(path, e.target.value === "" ? undefined : Number(e.target.value))
        }
      />
    </FieldShell>
  )
}

export function SelectField<T extends string>({
  path,
  label,
  options,
  help,
  className,
}: {
  path: Path
  label: string
  options: ReadonlyArray<{ value: T; label: string }>
  help?: string
  className?: string
}) {
  const { config, set, issue } = useEditor()
  const id = useId()
  const error = issue(path)
  return (
    <FieldShell
      id={id}
      label={label}
      help={help}
      error={error}
      className={className}
    >
      <select
        id={id}
        value={(getIn(config, path) as string | undefined) ?? ""}
        onChange={(e) => set(path, e.target.value)}
        aria-invalid={!!error}
        className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export function ToggleField({
  path,
  label,
  help,
}: {
  path: Path
  label: string
  help?: string
}) {
  const { config, set } = useEditor()
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card/50 px-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {help && <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>}
      </div>
      <Switch
        id={id}
        checked={getIn(config, path) === true}
        onCheckedChange={(on) => set(path, on)}
      />
    </div>
  )
}

/** Wall-clock input in the event's time zone; stores ISO with offset. */
export function DateTimeField({
  path,
  label,
  help,
  optional,
  className,
}: {
  path: Path
  label: string
  help?: string
  optional?: boolean
  className?: string
}) {
  const { config, set, issue } = useEditor()
  const id = useId()
  const tz = config.datetime.timezone
  const iso = getIn(config, path) as string | undefined
  const error = issue(path)
  return (
    <FieldShell
      id={id}
      label={label}
      help={help ?? `Time in ${tz}`}
      error={error}
      optional={optional}
      className={className}
    >
      <Input
        id={id}
        type="datetime-local"
        value={iso ? toZonedInput(iso, tz) : ""}
        aria-invalid={!!error}
        onChange={(e) => {
          if (!e.target.value) return set(path, optional ? undefined : iso)
          const next = fromZonedInput(e.target.value, tz)
          if (next) set(path, next)
        }}
      />
    </FieldShell>
  )
}

/** Section heading inside a tab. */
export function Group({
  title,
  description,
  children,
  action,
}: {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-6 first:border-t-0 first:pt-0">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl text-foreground">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
