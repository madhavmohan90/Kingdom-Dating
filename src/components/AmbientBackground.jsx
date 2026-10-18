import { useMemo } from 'react'

export default function AmbientBackground({ world = 'kingdom' }) {
  const particles = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 2,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      opacity: 0.2 + Math.random() * 0.4,
    }))
  }, [])

  const colors = {
    kingdom: { glow1: 'rgba(45,27,105,0.2)', glow2: 'rgba(139,26,61,0.1)', particle: 'rgba(212,168,67,0.5)' },
    cosmos: { glow1: 'rgba(13,27,62,0.25)', glow2: 'rgba(26,13,74,0.15)', particle: 'rgba(147,197,253,0.5)' },
    shadows: { glow1: 'rgba(26,107,74,0.12)', glow2: 'rgba(17,26,13,0.15)', particle: 'rgba(74,222,128,0.4)' },
  }

  const c = colors[world] || colors.kingdom

  return (
    <>
      {/* Ambient mist */}
      <div className="ambient-mist" />

      {/* Extra glow orbs */}
      <div
        className="fixed pointer-events-none z-0 animate-glow-pulse"
        style={{
          top: '10%', right: '-10%',
          width: '400px', height: '400px',
          background: `radial-gradient(circle, ${c.glow1} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0 animate-glow-pulse"
        style={{
          bottom: '20%', left: '-5%',
          width: '350px', height: '350px',
          background: `radial-gradient(circle, ${c.glow2} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(80px)',
          animationDelay: '1.5s',
        }}
      />

      {/* Floating particles */}
      <div className="particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: c.particle,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size * 3}px ${c.particle}`,
            }}
          />
        ))}
      </div>
    </>
  )
}
