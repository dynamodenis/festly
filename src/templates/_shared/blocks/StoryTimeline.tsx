import { cn } from "@/lib/utils"
import { useInvitation } from "../context"
import { Section, type BlockProps } from "./Section"

export type StoryVariant = "alternating" | "list" | "milestones"

type StoryProps = BlockProps & {
  variant?: StoryVariant
}

/** Chronological story: a couple's journey, a graduate's milestones, a life so far. */
export function StoryTimeline({
  variant = "alternating",
  eyebrow = "Our story",
  title = "How we got here",
  tone,
  className,
}: StoryProps) {
  const { config } = useInvitation()
  const items = config.story

  if (variant === "milestones") {
    return (
      <Section
        id="story"
        tone={tone}
        eyebrow={eyebrow}
        title={title}
        width="wide"
        className={className}
      >
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <li
              key={item.title + i}
              className="flex flex-col gap-3 rounded-inv border border-inv-line bg-inv-surface p-6"
            >
              <span className="font-inv-display text-4xl text-inv-primary/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.date && (
                <p className="text-xs tracking-[0.2em] text-inv-primary uppercase">
                  {item.date}
                </p>
              )}
              <h3 className="font-inv-display text-2xl">{item.title}</h3>
              <p className="text-sm leading-relaxed text-inv-muted">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>
    )
  }

  return (
    <Section
      id="story"
      eyebrow={eyebrow}
      title={title}
      tone={tone}
      className={className}
    >
      <ol className="relative flex flex-col gap-12 before:absolute before:top-0 before:bottom-0 before:left-4 before:w-px before:bg-inv-line sm:before:left-1/2">
        {items.map((item, i) => {
          const right = variant === "alternating" && i % 2 === 1
          return (
            <li
              key={item.title + i}
              className={cn(
                "relative pl-12 sm:w-1/2 sm:pl-0",
                right ? "sm:ml-auto sm:pl-12" : "sm:pr-12 sm:text-right",
                variant === "list" && "sm:ml-auto sm:pl-12 sm:text-left"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-2 left-4 size-3 -translate-x-1/2 rounded-full bg-inv-primary ring-4 ring-inv-bg",
                  right || variant === "list"
                    ? "sm:left-0"
                    : "sm:-right-1.5 sm:left-auto sm:translate-x-0"
                )}
              />
              {item.photo && (
                <img
                  src={item.photo.url}
                  alt={item.photo.alt ?? ""}
                  width={item.photo.width}
                  height={item.photo.height}
                  loading="lazy"
                  className="mb-4 aspect-[3/2] w-full rounded-inv object-cover"
                />
              )}
              {item.date && (
                <p className="text-xs tracking-[0.2em] text-inv-primary uppercase">
                  {item.date}
                </p>
              )}
              <h3 className="mt-1 font-inv-display text-2xl">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-inv-muted">{item.body}</p>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
