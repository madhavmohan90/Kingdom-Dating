import { useNavigate } from 'react-router-dom'
import AmbientBackground from '../components/AmbientBackground'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      <AmbientBackground world="kingdom" />

      {/* Top ornamental line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kingdom-gold/30 to-transparent" />

      <div className="relative z-10 max-w-md mx-auto">
        {/* Crown with glow */}
        <div className="relative mb-8">
          <div className="text-7xl animate-float-slow filter drop-shadow-lg">👑</div>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full animate-glow-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(212,168,67,0.2) 0%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
        </div>

        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-kingdom-gold/40" />
          <span className="text-kingdom-gold/40 text-xs tracking-[0.3em]">✦</span>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-kingdom-gold/40" />
        </div>

        {/* Title with shimmer */}
        <h1 className="font-display text-4xl md:text-5xl font-bold text-shimmer mb-4 tracking-wide leading-tight">
          Kingdom Dating
        </h1>

        {/* Tagline */}
        <p className="text-kingdom-gold/70 text-lg mb-2 font-display tracking-wide">
          Fall for a voice. Not a face.
        </p>
        <p className="text-white/40 text-sm mb-12 max-w-xs mx-auto leading-relaxed">
          No photos. No forms. Answer three wild trials with your voice — dragons, vampires, love potions — and fall for someone by how they answer.
        </p>

        {/* CTA Buttons */}
        <div className="space-y-4 w-full">
          <button
            onClick={() => navigate('/gate')}
            className="btn-gold w-full text-lg glow-gold relative overflow-hidden group"
          >
            <span className="relative z-10">Enter the Kingdom</span>
            {/* Shine sweep on hover */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>

          <button
            onClick={() => navigate('/signup?mode=login')}
            className="btn-outline w-full"
          >
            Return to your realm
          </button>
        </div>

        {/* Bottom ornament */}
        <div className="flex items-center justify-center gap-3 mt-12 mb-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-kingdom-gold/20" />
          <span className="text-kingdom-gold/20 text-[10px] tracking-[0.3em]">⚔</span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-kingdom-gold/20" />
        </div>

        <p className="text-white/20 text-xs">
          Audio-first dating. No photos. Pure connection.
        </p>
      </div>

      {/* Bottom ornamental line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kingdom-gold/20 to-transparent" />
    </div>
  )
}
