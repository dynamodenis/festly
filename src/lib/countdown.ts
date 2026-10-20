export type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** True once the target instant has passed. */
  done: boolean
}

/** Whole days/hours/minutes/seconds from `now` until `target` (ms). Clamps at zero. */
export function countdownParts(target: number, now: number): CountdownParts {
  const diff = Math.max(0, target - now)
  const total = Math.floor(diff / 1000)
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: diff === 0,
  }
}
