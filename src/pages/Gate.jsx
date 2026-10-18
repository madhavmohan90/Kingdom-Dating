import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AmbientBackground from '../components/AmbientBackground'

const paths = [
  {
    id: 'female',
    emoji: '🕯️',
    name: 'The Seeker',
    line: 'I came to listen.',
    desc: 'Wander the realm and hear the voices that call to you.',
  },
  {
    id: 'male',
    emoji: '🎙️',
    name: 'The Bard',
    line: 'I came to be heard.',
    desc: 'Answer the quests with your voice and let them find you.',
  },
]

export default function Gate() {
  const navigate = useNavigate()
  const [path, setPath] = useState(null)
  const [sworn, setSworn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const enter = async () => {
    if (!path || !sworn || loading) return
    setLoading(true)
    setError('')
    try {
      // Reuse an existing session if there is one, otherwise open a nameless account.
      let { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) throw error
        session = data.session
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: session.user.id,
        gender: path,
        selected_world: 'kingdom',
        oath_taken_at: new Date().toISOString(),
      })
      if (profileError) throw profileError

      navigate('/quiz')
    } catch (err) {
      setError(err.message || 'The gate would not open. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <AmbientBackground world="kingdom" />

      <div className="w-full max-w-md relative z-10">
        <button
          onClick={() => navigate('/')}
          className="text-white/30 hover:text-kingdom-gold/60 mb-8 text-sm transition-colors"
        >
          ← Back
        </button>

        <div className="text-center mb-8">
          <p className="text-kingdom-gold/40 text-xs tracking-[0.3em] uppercase font-display mb-3">✦ The Gate ✦</p>
          <h1 className="font-display text-3xl font-bold text-shimmer mb-3">Who approaches?</h1>
          <p className="text-white/40 text-sm">Choose your path through the realm.</p>
        </div>

        <div className="space-y-3 mb-8">
          {paths.map(p => (
            <button
              key={p.id}
              onClick={() => setPath(p.id)}
              className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden
                ${path === p.id
                  ? 'bg-kingdom-gold/15 border-kingdom-gold/50 scale-[1.02]'
                  : 'bg-white/4 border-kingdom-gold/10 hover:border-kingdom-gold/25'}`}
            >
              {path === p.id && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kingdom-gold/50 to-transparent" />
              )}
              <div className="flex items-center gap-4">
                <span className="text-4xl">{p.emoji}</span>
                <div>
                  <p className="font-display text-lg text-white">{p.name}</p>
                  <p className="text-kingdom-gold/70 text-sm italic font-display">{p.line}</p>
                  <p className="text-white/35 text-xs mt-1">{p.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setSworn(!sworn)}
          className={`w-full text-left p-4 rounded-xl border transition-all mb-6 flex items-start gap-3
            ${sworn ? 'border-kingdom-gold/40 bg-kingdom-gold/10' : 'border-kingdom-gold/10 bg-white/4'}`}
        >
          <span className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 text-xs
            ${sworn ? 'border-kingdom-gold bg-kingdom-gold text-kingdom-darker' : 'border-white/20 text-transparent'}`}>
            ✓
          </span>
          <span className="text-sm text-white/60 font-display leading-snug">
            I swear upon the old oath that I have seen eighteen winters.
          </span>
        </button>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={enter}
          disabled={!path || !sworn || loading}
          className="btn-gold w-full text-lg disabled:opacity-40 relative overflow-hidden group"
        >
          <span className="relative z-10">{loading ? 'The gate opens...' : 'Step Through'}</span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </button>
        {(!path || !sworn) && (
          <p className="text-kingdom-gold/50 text-xs text-center mt-3 font-display">
            {!path ? 'Choose your path above.' : 'Tap the oath above to proceed.'}
          </p>
        )}
      </div>
    </div>
  )
}
