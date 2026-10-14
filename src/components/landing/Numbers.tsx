import { ClientOnly } from "@tanstack/react-router"
import CountUp from "@/components/reactbits/CountUp"
import { Reveal } from "./Reveal"

const NUMBERS = [
  { value: 50, suffix: "", label: "Templates" },
  { value: 7, suffix: "", label: "Event types" },
  { value: 13, suffix: "", label: "Ready-made sections" },
  { value: 1, suffix: "", label: "Link to share" },
]

export function Numbers() {
  return (
    <section className="border-y border-gold/10 bg-umber/40">
      <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-y-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        {NUMBERS.map((item, i) => (
          <Reveal
            key={item.label}
            delay={i * 0.1}
            distance={30}
            className="flex flex-col-reverse text-center"
          >
            <dt className="mt-2 label">{item.label}</dt>
            <dd className="nums text-5xl text-gold-soft">
              <ClientOnly fallback={<span>{item.value}</span>}>
                <CountUp to={item.value} duration={2} />
              </ClientOnly>
              <span className="text-2xl text-gold">{item.suffix}</span>
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
