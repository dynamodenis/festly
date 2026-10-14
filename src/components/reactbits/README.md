# ReactBits components (registry-owned)

Every file in this folder was fetched from the `@react-bits` shadcn registry
(`https://reactbits.dev/r/{name}.json`) and is **not** hand-written. Do not edit
these files beyond trivial fixes; wrap them in `src/templates/_shared/effects`
instead. Re-fetch with:

```bash
pnpm dlx shadcn@latest add @react-bits/<Name>-TS-TW
```

The CLI drops files into `src/components/`; move them here afterwards.

| File           | Command used                                            | Peer deps added   |
| -------------- | ------------------------------------------------------- | ----------------- |
| `BlurText.tsx` | `pnpm dlx shadcn@latest add @react-bits/BlurText-TS-TW` | `motion`          |
| `Aurora.tsx`   | `pnpm dlx shadcn@latest add @react-bits/Aurora-TS-TW`   | none (raw WebGL2) |

License: MIT + Commons Clause. We may use these inside the product; we may not
sell, sublicense or redistribute the component source. Never ship a feature
that exports template source containing this code.
