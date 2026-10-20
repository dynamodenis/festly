import { cn } from "@/lib/utils"
import { useInvitation } from "../context"
import type { Host } from "../schema"
import { Section, type BlockProps } from "./Section"
import { ROLE_LABEL, initials } from "./hosts"

export type HostsVariant = "duo" | "list" | "spotlight"
export type PortraitShape = "circle" | "arch" | "square"

type HostsProps = BlockProps & {
  variant?: HostsVariant
  portrait?: PortraitShape
}

const shapes: Record<PortraitShape, string> = {
  circle: "aspect-square rounded-full",
  arch: "aspect-[3/4] rounded-t-full rounded-b-inv",
  square: "aspect-square rounded-inv",
}

function Portrait({
  host,
  size,
  shape,
}: {
  host: Host
  size: "lg" | "md"
  shape: PortraitShape
}) {
  const width = size === "lg" ? "w-44 sm:w-52" : "w-28"
  const frame = cn(width, shapes[shape], "relative overflow-hidden")
  return (
    <div className="relative">
      {/* Offset outline gives the portrait a printed, framed feel. */}
      <div
        aria-hidden="true"
        className={cn(
          width,
          shapes[shape],
          "absolute inset-0 translate-x-2 translate-y-2 border border-inv-primary/50"
        )}
      />
      {host.photo ? (
        <img
          src={host.photo.url}
          alt={host.photo.alt ?? host.name}
          width={host.photo.width}
          height={host.photo.height}
          loading="lazy"
          decoding="async"
          className={cn(frame, "object-cover")}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            frame,
            "flex items-center justify-center bg-inv-secondary font-inv-display text-4xl text-inv-primary"
          )}
        >
          {initials(host.name)}
        </div>
      )}
    </div>
  )
}

function HostCard({
  host,
  size,
  shape,
}: {
  host: Host
  size: "lg" | "md"
  shape: PortraitShape
}) {
  const role = ROLE_LABEL[host.role]
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <Portrait host={host} size={size} shape={shape} />
      <div className="flex flex-col gap-1.5">
        {role && (
          <p className="text-[0.7rem] tracking-[0.28em] text-inv-primary uppercase">
            {role}
          </p>
        )}
        <h3 className="font-inv-display text-3xl sm:text-4xl">{host.name}</h3>
        {host.parentsLine && (
          <p className="text-sm text-inv-muted italic">{host.parentsLine}</p>
        )}
      </div>
    </div>
  )
}

/** The people being celebrated: a couple, a graduate, a birthday kid. */
export function Hosts({
  variant = "duo",
  portrait = "circle",
  eyebrow,
  title,
  tone,
  className,
}: HostsProps) {
  const { config } = useInvitation()
  const [lead, ...rest] = config.hosts

  return (
    <Section
      id="hosts"
      eyebrow={eyebrow}
      title={title}
      tone={tone}
      width="wide"
      className={className}
    >
      {variant === "duo" && (
        <div className="flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-16">
          {config.hosts.map((host, i) => (
            <div key={i} className="contents">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="inv-foil font-inv-display text-6xl italic sm:mt-24 sm:text-7xl"
                >
                  &amp;
                </span>
              )}
              <HostCard host={host} size="lg" shape={portrait} />
            </div>
          ))}
        </div>
      )}
      {variant === "spotlight" && (
        <div className="flex flex-col items-center gap-12">
          <HostCard host={lead} size="lg" shape={portrait} />
          {rest.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-10">
              {rest.map((host, i) => (
                <li key={i}>
                  <HostCard host={host} size="md" shape={portrait} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {variant === "list" && (
        <ul className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {config.hosts.map((host, i) => (
            <li key={i}>
              <HostCard host={host} size="md" shape={portrait} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
