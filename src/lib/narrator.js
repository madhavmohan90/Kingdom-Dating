// Plays ElevenLabs narration clips from public/narration/<key>.mp3.
// A missing clip is skipped silently, so the app works before the audio exists.

let current = null
const listeners = new Set()

export function isMuted() {
  try { return localStorage.getItem('kd-muted') === '1' } catch { return false }
}

export function setMuted(muted) {
  try { localStorage.setItem('kd-muted', muted ? '1' : '0') } catch { /* ignore */ }
  if (muted) stopNarration()
  listeners.forEach(fn => fn(muted))
}

export function onMuteChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function stopNarration() {
  if (current) {
    current.onended = null
    current.pause()
    current = null
  }
}

// Plays one key, or several keys one after another.
export function narrate(keys) {
  stopNarration()
  if (isMuted()) return
  const queue = Array.isArray(keys) ? [...keys] : [keys]

  const playNext = () => {
    const key = queue.shift()
    if (!key) return
    const audio = new Audio(`${import.meta.env.BASE_URL}narration/${key}.mp3`)
    audio.volume = 0.9
    current = audio
    audio.onended = playNext
    audio.onerror = playNext
    audio.play().catch(() => { /* blocked or missing: stay quiet */ })
  }
  playNext()
}
