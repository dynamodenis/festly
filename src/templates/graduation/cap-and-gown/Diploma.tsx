import { GraduationCap } from "lucide-react"
import { Seal } from "../../_shared/decor"
import type { CapAndGownConfig } from "./schema"

/**
 * The school, degree and year presented as a small framed diploma with an
 * embossed seal on its corner. Text stays real text for readers and SEO.
 */
export function Diploma({
  graduate,
  graduation,
}: {
  graduate: string
  graduation: CapAndGownConfig["graduation"]
}) {
  const year = `'${String(graduation.classOf).slice(-2)}`
  return (
    <div className="relative mt-10 w-full max-w-lg">
      <div className="relative rounded-inv border border-inv-primary/40 bg-inv-bg/60 px-8 pt-10 pb-16 text-center backdrop-blur-sm">
        <div
          aria-hidden="true"
          className="inv-frame [--inv-frame-inset:0.5rem]"
        />
        <GraduationCap
          className="mx-auto size-6 text-inv-primary"
          aria-hidden="true"
        />
        <dl className="mt-4 flex flex-col items-center gap-2">
          <dt className="sr-only">Graduate</dt>
          <dd className="font-inv-display text-2xl">{graduate}</dd>
          <dt className="sr-only">School</dt>
          <dd className="text-inv-muted">{graduation.school}</dd>
          {graduation.degree && (
            <>
              <dt className="sr-only">Degree</dt>
              <dd className="mt-2 text-xs tracking-[0.3em] text-inv-primary uppercase">
                {graduation.degree}
              </dd>
            </>
          )}
        </dl>
      </div>
      <Seal
        label={year}
        caption="Class of"
        className="absolute -bottom-12 left-1/2 size-24 -translate-x-1/2 sm:size-28"
      />
    </div>
  )
}
