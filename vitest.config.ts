import { defineConfig } from "vitest/config"
import viteReact from "@vitejs/plugin-react"

// Kept separate from vite.config.ts so tests don't boot the TanStack Start
// server plugin or devtools.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
