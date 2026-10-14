// Opens a page in the system Chrome, waits for hydration and reports every
// console warning/error (React hydration mismatches show up here).
// Usage: node scripts/smoke-check.mjs [url]
import { chromium } from "playwright-core"

const url = process.argv[2] ?? "http://localhost:3000/dev/smoke"
const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
})
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const messages = []
page.on("console", (m) => messages.push(`[${m.type()}] ${m.text()}`))
page.on("pageerror", (e) => messages.push(`[pageerror] ${e.message}`))

await page.goto(url, { waitUntil: "networkidle" })
const ssrText = await page.locator("main").innerText()

const report = {}
for (const [name, selector] of [
  ["blurText", "p.blur-text span"],
  ["auroraCanvas", "canvas"],
]) {
  try {
    await page.waitForSelector(selector, { timeout: 15000 })
    report[name] = "present"
  } catch {
    report[name] = "MISSING"
  }
}
const problems = messages.filter(
  (m) =>
    /^\[(error|warning|pageerror)\]/.test(m) &&
    !/React DevTools|\[vite\]/.test(m)
)
console.log(
  JSON.stringify(
    { url, ...report, problems, messageCount: messages.length },
    null,
    2
  )
)
console.log("first text:", ssrText.split("\n")[1])
await browser.close()
process.exit(
  problems.length || Object.values(report).includes("MISSING") ? 1 : 0
)
