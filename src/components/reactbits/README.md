# ReactBits components (registry-owned)

Every file in this folder was fetched from the `@react-bits` shadcn registry
(`https://reactbits.dev/r/{name}.json`) and is **not** hand-written. Do not edit
these files beyond trivial fixes; wrap them in `src/templates/_shared/effects`
instead. Phase 2 (2026-10-20) added the eight rows after CountUp in one CLI call. Re-fetch with:

```bash
pnpm dlx shadcn@latest add @react-bits/<Name>-TS-TW
```

The CLI drops files into `src/components/`; move them here afterwards.

| File                  | Command used                                                   | Peer deps added                                  |
| --------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `BlurText.tsx`        | `pnpm dlx shadcn@latest add @react-bits/BlurText-TS-TW`        | `motion`                                         |
| `Aurora.tsx`          | `pnpm dlx shadcn@latest add @react-bits/Aurora-TS-TW`          | none (raw WebGL2)                                |
| `ShinyText.tsx`       | `pnpm dlx shadcn@latest add @react-bits/ShinyText-TS-TW`       | none                                             |
| `AnimatedContent.tsx` | `pnpm dlx shadcn@latest add @react-bits/AnimatedContent-TS-TW` | `gsap`                                           |
| `SpotlightCard.tsx`   | `pnpm dlx shadcn@latest add @react-bits/SpotlightCard-TS-TW`   | none                                             |
| `CountUp.tsx`         | `pnpm dlx shadcn@latest add @react-bits/CountUp-TS-TW`         | `motion`                                         |
| `Silk.tsx`            | `pnpm dlx shadcn@latest add @react-bits/Silk-TS-TW`            | none (raw WebGL2)                                |
| `Particles.tsx`       | `pnpm dlx shadcn@latest add @react-bits/Particles-TS-TW`       | none (raw WebGL2)                                |
| `Iridescence.tsx`     | `pnpm dlx shadcn@latest add @react-bits/Iridescence-TS-TW`     | none (raw WebGL2)                                |
| `Waves.tsx`           | `pnpm dlx shadcn@latest add @react-bits/Waves-TS-TW`           | none (raw WebGL2)                                |
| `SplitText.tsx`       | `pnpm dlx shadcn@latest add @react-bits/SplitText-TS-TW`       | `gsap`, `@gsap/react`                            |
| `TiltedCard.tsx`      | `pnpm dlx shadcn@latest add @react-bits/TiltedCard-TS-TW`      | none                                             |
| `Carousel.tsx`        | `pnpm dlx shadcn@latest add @react-bits/Carousel-TS-TW`        | `@hugeicons/react`, `@hugeicons/core-free-icons` |
| `FadeContent.tsx`     | `pnpm dlx shadcn@latest add @react-bits/FadeContent-TS-TW`     | `gsap`                                           |

License: MIT + Commons Clause. We may use these inside the product; we may not
sell, sublicense or redistribute the component source. Never ship a feature
that exports template source containing this code.
