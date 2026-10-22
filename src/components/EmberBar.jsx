// Compact level + embers bar. Shows a one-time level-up banner.
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { loadProgress, checkLevelUp } from '../lib/progress'
import { narrate } from '../lib/narrator'

export default function EmberBar({ onLoaded }) {
  const [p, setP] = useState(null)
  const [levelUp, setLevelUp] = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const progress = await loadProgress(user.id)
      setP(progress)
      onLoaded?.(progress)
      if (checkLevelUp(progress.level.name)) {
        setLevelUp(true)
        narrate('level-up')
        setTimeout(() => setLevelUp(false), 4000)
      }
    })()
  }, [])

  if (!p) return null
  const { level, embers } = p

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/4 border border-kingdom-gold/10">
        <span className="text-xl">{level.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between text-[11px] font-display mb-1">
            <span className="text-kingdom-gold/80">{level.name}</span>
            <span className="text-white/40">🔥 {embers} embers{level.next ? ` · ${level.next.min - embers} to ${level.next.name}` : ''}</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-gold rounded-full transition-all duration-700" style={{ width: `${Math.round(level.progress * 100)}%` }} />
          </div>
        </div>
      </div>

      {levelUp && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-kingdom-darker/95 border border-kingdom-gold/50 glow-gold animate-fade-in text-center">
          <p className="text-kingdom-gold/60 text-[10px] uppercase tracking-[0.3em] font-display">You have risen</p>
          <p className="font-display text-lg text-shimmer">{level.emoji} {level.name}</p>
        </div>
      )}
    </>
  )
}
