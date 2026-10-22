// Plays ElevenLabs narration clips from public/narration/<key>.mp3.
// A missing clip is skipped silently, so the app works before the audio exists.
// Browsers block sound until the person taps the page: when that happens, the
// clip waits and plays on the next tap anywhere.

let current = null
let pending = null // a clip queue blocked by the browser, waiting for a tap
const muteListeners = new Set()
const pendingListeners = new Set()

export function isMuted() {
  try { return localStorage.getItem('kd-muted') === '1' } catch { return false }
}

export function setMuted(muted) {
  try { localStorage.setItem('kd-muted', muted ? '1' : '0') } catch { /* ignore */ }
  if (muted) stopNarration()
  muteListeners.forEach(fn => fn(muted))
}

export function onMuteChange(fn) {
  muteListeners.add(fn)
  return () => muteListeners.delete(fn)
}

// Lets the speaker button show "tap to hear" while a clip is waiting.
export function onPendingChange(fn) {
  pendingListeners.add(fn)
  return () => pendingListeners.delete(fn)
}

function setPending(queue) {
  pending = queue
  pendingListeners.forEach(fn => fn(!!queue))
}

export function stopNarration() {
  setPending(null)
  if (current) {
    current.onended = null
    current.onerror = null
    current.pause()
    current = null
  }
}

function playQueue(queue) {
  const key = queue.shift()
  if (!key) return
  const audio = new Audio(`${import.meta.env.BASE_URL}narration/${key}.mp3`)
  audio.volume = 0.9
  current = audio
  audio.onended = () => playQueue(queue)
  audio.onerror = () => playQueue(queue) // clip not recorded yet: skip it
  audio.play().catch(err => {
    if (err?.name === 'NotAllowedError') setPending([key, ...queue])
  })
}

// Plays one key, or several keys one after another.
export function narrate(keys) {
  stopNarration()
  if (isMuted()) return
  playQueue(Array.isArray(keys) ? [...keys] : [keys])
}

// First tap anywhere releases a clip the browser blocked.
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', () => {
    if (pending && !isMuted()) {
      const queue = pending
      setPending(null)
      playQueue(queue)
    }
  }, true)
}
