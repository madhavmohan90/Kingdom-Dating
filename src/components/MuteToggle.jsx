// Floating speaker button: turns the narrator on/off, and invites a tap
// when the browser has blocked a narration clip.
import { useEffect, useState } from 'react'
import { isMuted, setMuted, onMuteChange, onPendingChange } from '../lib/narrator'

export default function MuteToggle() {
  const [muted, setM] = useState(isMuted())
  const [waiting, setWaiting] = useState(false)
  useEffect(() => onMuteChange(setM), [])
  useEffect(() => onPendingChange(setWaiting), [])

  if (waiting && !muted) {
    return (
      <button
        className="fixed top-3 right-3 z-50 px-3 h-9 rounded-full bg-kingdom-gold/90 text-kingdom-darker text-xs font-display flex items-center gap-1.5 shadow-lg animate-pulse"
      >
        🔊 Tap to hear the narrator
      </button>
    )
  }

  return (
    <button
      onClick={() => setMuted(!muted)}
      aria-label={muted ? 'Turn narrator on' : 'Turn narrator off'}
      className="fixed top-3 right-3 z-50 w-9 h-9 rounded-full bg-kingdom-darker/70 border border-kingdom-gold/20 text-sm flex items-center justify-center backdrop-blur-sm hover:border-kingdom-gold/50 transition-colors"
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
