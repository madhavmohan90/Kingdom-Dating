import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const worlds = [
  {
    id: 'kingdom',
    name: 'The Kingdom',
    tagline: 'Where loyalty is forged in fire',
    description: 'Medieval castles, sworn oaths, and voices that echo through stone halls.',
    emoji: '🏰',
    gradient: 'from-amber-900/30 to-kingdom-darker',
    available: true,
  },
  {
    id: 'cosmos',
    name: 'The Cosmos',
    tagline: 'Where stars align for two souls',
    description: 'Deep space, cosmic signals, and voices that travel across galaxies.',
    emoji: '🌌',
    gradient: 'from-indigo-900/30 to-kingdom-darker',
    available: true,
  },
  {
    id: 'shadows',
    name: 'The Shadows',
    tagline: 'Where mystery speaks louder than light',
    description: 'Dark forests, ancient secrets, and voices that whisper in the mist.',
    emoji: '🌑',
    gradient: 'from-slate-900/30 to-kingdom-darker',
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
    <div className="min-h-screen bg-gradient-kingdom px-6 py-12">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-3xl font-bold text-kingdom-gold mb-2 text-center">
          Choose Your World
        </h1>
        <p className="text-white/50 text-sm text-center mb-10">
          Each world has its own quests, narrators, and atmosphere.
        </p>

        <div className="space-y-4">
          {worlds.map((world) => (
            <button
              key={world.id}
              onClick={() => world.available && handleSelect(world.id)}
              disabled={!world.available}
              className={`w-full text-left rounded-2xl border overflow-hidden transition-all duration-300
                ${world.available
                  ? 'border-white/10 hover:border-kingdom-gold/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'border-white/5 opacity-40 cursor-not-allowed'
                }`}
            >
              <div className={`bg-gradient-to-r ${world.gradient} p-6`}>
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{world.emoji}</span>
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
                    <p className="text-kingdom-gold/70 text-sm italic mb-2">
                      {world.tagline}
                    </p>
                    <p className="text-white/40 text-xs leading-relaxed">
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
