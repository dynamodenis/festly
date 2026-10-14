// CSS-only animated backdrop: drifting gold glows, slow light rays and rising
// sparkles. SSR-safe, no WebGL, and frozen by the reduced-motion rule in styles.css.

// Deterministic positions so server and client markup match.
const SPARKS = Array.from({ length: 28 }, (_, i) => {
  const seed = (i * 37) % 100
  return {
    left: `${(i * 53) % 100}%`,
    size: 2 + (seed % 3),
    delay: `${(i * 0.7) % 9}s`,
    duration: `${9 + (seed % 7)}s`,
    opacity: 0.35 + (seed % 5) / 10,
  }
})

export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(201,160,90,0.22),transparent_70%)]" />

      <div className="absolute -top-1/2 left-1/2 size-[180vmax] -translate-x-1/2 animate-rays bg-[repeating-conic-gradient(from_0deg,rgba(230,203,149,0.07)_0deg_6deg,transparent_6deg_18deg)] [mask-image:radial-gradient(circle,#000_0%,transparent_45%)]" />

      <div className="absolute top-[8%] left-[12%] size-[34rem] animate-drift-a rounded-full bg-gold/25 blur-[120px]" />
      <div className="absolute top-[30%] right-[5%] size-[28rem] animate-drift-b rounded-full bg-bronze/40 blur-[110px]" />
      <div className="absolute bottom-[-10%] left-[40%] size-[24rem] animate-drift-a rounded-full bg-gold-soft/10 blur-[100px] [animation-delay:-8s]" />

      {SPARKS.map((spark, i) => (
        <span
          key={i}
          className="absolute bottom-0 animate-rise rounded-full bg-gold-soft shadow-[0_0_8px_2px_rgba(230,203,149,0.6)]"
          style={{
            left: spark.left,
            width: spark.size,
            height: spark.size,
            opacity: 0,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
            ["--spark-opacity" as string]: spark.opacity,
          }}
        />
      ))}
    </div>
  )
}
