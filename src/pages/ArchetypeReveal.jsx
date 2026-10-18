import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AmbientBackground from '../components/AmbientBackground'

const archetypes = {
  protector: {
    name: "The Protector",
    emoji: "🛡️",
    title: "Guardian of the Realm",
    description: "You are the shield others lean on. Steady, reliable, and fiercely loyal — your strength isn't in fighting, it's in standing firm when everyone else runs.",
    trait: "Loyal • Strong • Dependable",
    color: "from-blue-900/40 to-kingdom-darker",
  },
  genius: {
    name: "The Genius",
    emoji: "🧠",
    title: "Keeper of Forbidden Knowledge",
    description: "Your mind is your weapon. You see patterns others miss, solve what others can't, and your curiosity makes you endlessly fascinating.",
    trait: "Brilliant • Curious • Strategic",
    color: "from-purple-900/40 to-kingdom-darker",
  },
  rebel: {
    name: "The Rebel",
    emoji: "⚡",
    title: "Breaker of Chains",
    description: "Rules bore you. Convention suffocates you. You live by your own code and inspire others to question everything they've been told.",
    trait: "Bold • Fearless • Authentic",
    color: "from-red-900/40 to-kingdom-darker",
  },
  romantic: {
    name: "The Romantic",
    emoji: "🌹",
    title: "Voice of the Heart",
    description: "You feel everything deeply. Your words carry weight, your presence feels like a poem, and you believe love is the only quest worth taking.",
    trait: "Passionate • Expressive • Deep",
    color: "from-pink-900/40 to-kingdom-darker",
  },
  commander: {
    name: "The Commander",
    emoji: "👑",
    title: "Ruler of Destiny",
    description: "You were born to lead. Not through force, but through vision — people follow you because you see the path when others see only fog.",
    trait: "Decisive • Charismatic • Visionary",
    color: "from-amber-900/40 to-kingdom-darker",
  },
  adventurer: {
    name: "The Adventurer",
    emoji: "🗺️",
    title: "Walker Between Worlds",
    description: "Life is too short for routine. You chase sunsets, dive into the unknown, and every conversation with you feels like the beginning of a story.",
    trait: "Spontaneous • Energetic • Free",
    color: "from-emerald-900/40 to-kingdom-darker",
  },
  healer: {
    name: "The Healer",
    emoji: "✨",
    title: "Mender of Souls",
    description: "You carry a quiet power — the ability to make anyone feel seen. Your empathy isn't weakness, it's the rarest kind of strength.",
    trait: "Empathetic • Calm • Wise",
    color: "from-teal-900/40 to-kingdom-darker",
  },
  wildcard: {
    name: "The Wildcard",
    emoji: "🃏",
    title: "Trickster of the Court",
    description: "No one can predict you — and that's exactly your power. You keep people guessing, laughing, and utterly captivated.",
    trait: "Unpredictable • Witty • Magnetic",
    color: "from-orange-900/40 to-kingdom-darker",
  },
}

export default function ArchetypeReveal() {
  const location = useLocation()
  const navigate = useNavigate()
  const [revealed, setRevealed] = useState(false)
  const [gender, setGender] = useState(null)
  const alias = location.state?.alias

  const archetypeKey = location.state?.archetype || 'protector'
  const archetype = archetypes[archetypeKey]

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 800)
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      setGender(data?.gender || null)
    })
    return () => clearTimeout(timer)
  }, [])

  const isBard = gender === 'male'

  return (
    <div className={`min-h-screen bg-gradient-to-b ${archetype.color} flex flex-col items-center justify-center px-6 text-center relative overflow-hidden`}>
      <AmbientBackground world="kingdom" />

      {/* Central glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none animate-glow-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(212,168,67,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className={`relative z-10 max-w-md transition-all duration-1000 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Archetype emoji */}
        <div className="text-7xl mb-6 animate-float-slow">{archetype.emoji}</div>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-kingdom-gold/30" />
          <p className="text-kingdom-gold/50 text-xs tracking-[0.3em] uppercase font-display">
            You are
          </p>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-kingdom-gold/30" />
        </div>

        {/* Archetype name */}
        <h1 className="font-display text-4xl md:text-5xl font-bold text-shimmer mb-2">
          {archetype.name}
        </h1>

        {/* Title */}
        <p className="text-white/40 text-sm italic mb-8 font-display">
          {archetype.title}
        </p>

        {alias && (
          <p className="text-kingdom-gold/80 text-sm mb-6 font-display">
            The realm shall call you <span className="text-kingdom-gold">{alias}</span>
          </p>
        )}

        {/* Description */}
        <div className="card-ornate text-left mb-6">
          <p className="text-white/60 text-base leading-relaxed">
            {archetype.description}
          </p>
        </div>

        {/* Traits */}
        <p className="text-kingdom-gold/60 text-sm tracking-[0.15em] mb-10 font-display">
          {archetype.trait}
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate(isBard ? '/voice-record' : '/worlds')}
          className="btn-gold w-full text-lg glow-gold relative overflow-hidden group"
        >
          <span className="relative z-10">{isBard ? 'Answer the First Quest' : 'Enter the Kingdom'}</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
      </div>
    </div>
  )
}
