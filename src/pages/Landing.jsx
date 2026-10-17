import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col items-center justify-center px-6 text-center">
      {/* Ambient glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-kingdom-purple/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto">
        {/* Crown icon */}
        <div className="text-6xl mb-6">👑</div>

        {/* Title */}
        <h1 className="font-display text-4xl md:text-5xl font-bold text-kingdom-gold mb-4 tracking-wide">
          Kingdom Dating
        </h1>

        {/* Tagline */}
        <p className="text-white/60 text-lg mb-2">
          Fall for a voice. Not a face.
        </p>
        <p className="text-white/40 text-sm mb-12">
          Enter fantasy worlds. Discover voices that move you.
        </p>

        {/* CTA Buttons */}
        <div className="space-y-4 w-full">
          <button
            onClick={() => navigate('/signup')}
            className="btn-gold w-full text-lg glow-gold"
          >
            Enter the Kingdom
          </button>

          <button
            onClick={() => navigate('/signup?mode=login')}
            className="btn-outline w-full"
          >
            I already have an account
          </button>
        </div>

        {/* Footer text */}
        <p className="text-white/30 text-xs mt-12">
          Audio-first dating. No photos. Pure connection.
        </p>
      </div>
    </div>
  )
}
