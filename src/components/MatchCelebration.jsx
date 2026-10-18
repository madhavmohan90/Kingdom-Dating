import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function MatchCelebration({ matchData, onClose }) {
  const navigate = useNavigate()
  const [stage, setStage] = useState(0) // 0=flash, 1=reveal, 2=actions

  useEffect(() => {
    // Dramatic reveal sequence
    const t1 = setTimeout(() => setStage(1), 600)
    const t2 = setTimeout(() => setStage(2), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const getArchetypeDisplay = (archetype) => {
    const map = {
      protector: { emoji: '🛡️', name: 'The Protector' },
      genius: { emoji: '🧠', name: 'The Genius' },
      rebel: { emoji: '⚡', name: 'The Rebel' },
      romantic: { emoji: '🌹', name: 'The Romantic' },
      commander: { emoji: '👑', name: 'The Commander' },
      adventurer: { emoji: '🗺️', name: 'The Adventurer' },
      healer: { emoji: '✨', name: 'The Healer' },
      wildcard: { emoji: '🃏', name: 'The Wildcard' },
    }
    return map[archetype] || { emoji: '❓', name: 'Unknown' }
  }

  const otherUser = matchData?.otherUser
  const archetype = getArchetypeDisplay(otherUser?.archetype)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay with gold pulse */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          stage >= 1
            ? 'bg-gradient-to-b from-kingdom-purple/95 via-kingdom-darker/98 to-kingdom-darker/95'
            : 'bg-white'
        }`}
        style={stage < 1 ? { animation: 'flash 0.6s ease-out' } : {}}
      />

      {/* Particles */}
      {stage >= 1 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-kingdom-gold rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-sm mx-auto">
        {/* Crown icon */}
        <div
          className={`transition-all duration-700 ${
            stage >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="text-7xl mb-6" style={{
            animation: stage >= 1 ? 'bounce-slow 2s ease-in-out infinite' : 'none'
          }}>
            👑
          </div>
        </div>

        {/* Title */}
        <div
          className={`transition-all duration-500 delay-300 ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="font-display text-4xl text-kingdom-gold mb-2 tracking-wide">
            It's a Match!
          </h1>
          <p className="text-white/50 text-sm mb-8">
            Two voices, drawn together by fate
          </p>
        </div>

        {/* Match info */}
        <div
          className={`transition-all duration-500 delay-500 ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {otherUser && (
            <div className="bg-white/5 border border-kingdom-gold/20 rounded-2xl p-6 mb-8 backdrop-blur-sm">
              <span className="text-4xl block mb-3">{archetype.emoji}</span>
              <p className="font-display text-xl text-kingdom-gold mb-1">
                {otherUser.name}
              </p>
              <p className="text-white/40 text-sm">
                {archetype.name}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div
          className={`space-y-3 transition-all duration-500 ${
            stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={() => {
              onClose()
              if (matchData?.matchId) {
                navigate(`/chat/${matchData.matchId}`)
              } else {
                navigate('/chats')
              }
            }}
            className="btn-gold w-full text-base py-4"
          >
            Send a Voice Note
          </button>
          <button
            onClick={onClose}
            className="w-full text-white/40 text-sm py-3 hover:text-white/60 transition-colors"
          >
            Keep Discovering
          </button>
        </div>
      </div>

      <style>{`
        @keyframes flash {
          0% { opacity: 0; }
          30% { opacity: 1; background: rgba(212, 168, 67, 0.3); }
          100% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
