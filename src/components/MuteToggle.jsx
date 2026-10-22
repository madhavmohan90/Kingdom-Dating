// Small floating button to turn the narrator on or off.
import { useEffect, useState } from 'react'
import { isMuted, setMuted, onMuteChange } from '../lib/narrator'

export default function MuteToggle() {
  const [muted, setM] = useState(isMuted())
  useEffect(() => onMuteChange(setM), [])

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
