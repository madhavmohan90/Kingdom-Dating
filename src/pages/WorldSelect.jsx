import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AmbientBackground from '../components/AmbientBackground'

const worlds = [
  {
    id: 'kingdom',
    name: 'The Kingdom',
    tagline: 'Where loyalty is forged in fire',
    description: 'Medieval castles, sworn oaths, and voices that echo through stone halls.',
    emoji: '🏰',
    gradient: 'from-amber-900/30 via-kingdom-purple/20 to-transparent',
    available: true,
  },
  {
    id: 'cosmos',
    name: 'The Cosmos',
    tagline: 'Where stars align for two souls',
    description: 'Deep space, cosmic signals, and voices that travel across galaxies.',
    emoji: '🌌',
    gradient: 'from-indigo-900/30 via-blue-900/20 to-transparent',
    available: true,
  },
  {
    id: 'shadows',
    name: 'The Shadows',
    tagline: 'Where mystery speaks louder than light',
    description: 'Dark forests, ancient secrets, and voices that whisper in the mist.',
    emoji: '🌑',
    gradient: 'from-emerald-900/20 via-slate-800/20 to-transparent',
    available: true,
  },
]

export default function WorldSelect() {
  const navigate = useNavigate()

  const handleSelect = async (worldId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ selected_world: worldId }).eq('id', user.id)
    }
    navigate('/voice-record')
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom px-6 py-12 relative overflow-hidden">
      <AmbientBackground world="kingdom" />

      <div className="max-w-md mx-auto relative z-10">
        {/* Ornamental header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-kingdom-gold/30" />
            <span className="text-kingdom-gold/40 text-xs">✦</span>
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-kingdom-gold/30" />
          </div>
          <h1 className="font-display text-3xl font-bold text-shimmer mb-3">
            Choose Your World
          </h1>
          <p className="text-white/40 text-sm max-w-xs mx-auto">
            Each world has its own quests, narrators, and atmosphere.
          </p>
        </div>

        <div className="space-y-4">
          {worlds.map((world) => (
            <button
              key={world.id}
              onClick={() => world.available && handleSelect(world.id)}
              disabled={!world.available}
              className={`w-full text-left rounded-2xl overflow-hidden transition-all duration-300 relative
                ${world.available
                  ? 'hover:scale-[1.02] active:scale-[0.98]'
                  : 'opacity-40 cursor-not-allowed'
                }`}
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: '1px solid rgba(212,168,67,0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              {/* Top gold line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kingdom-gold/20 to-transparent" />

              <div className={`bg-gradient-to-r ${world.gradient} p-6`}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl">{world.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg text-white font-semibold">
                        {world.name}
                      </h3>
                      {!world.available && (
                        <span className="text-[10px] bg-white/10 text-white/40 px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-kingdom-gold/60 text-sm italic mb-2 font-display">
                      {world.tagline}
                    </p>
                    <p className="text-white/35 text-xs leading-relaxed">
                      {world.description}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
