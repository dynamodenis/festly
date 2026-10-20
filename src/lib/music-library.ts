/**
 * Built-in music tracks. Files and licenses arrive in Phase 4; until then the
 * ids resolve to paths under /public/music so the player degrades gracefully
 * (a missing file simply never reaches "playing").
 */
export type LibraryTrack = { id: string; title: string; src: string }

export const MUSIC_LIBRARY: Array<LibraryTrack> = [
  { id: "gentle-piano", title: "Gentle Piano", src: "/music/gentle-piano.mp3" },
  { id: "warm-strings", title: "Warm Strings", src: "/music/warm-strings.mp3" },
  {
    id: "happy-ukulele",
    title: "Happy Ukulele",
    src: "/music/happy-ukulele.mp3",
  },
  { id: "bright-pop", title: "Bright Pop", src: "/music/bright-pop.mp3" },
  {
    id: "ceremonial-brass",
    title: "Ceremonial Brass",
    src: "/music/ceremonial-brass.mp3",
  },
]

export function libraryTrack(id: string): LibraryTrack | undefined {
  return MUSIC_LIBRARY.find((t) => t.id === id)
}
