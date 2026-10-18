import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AmbientBackground from '../components/AmbientBackground'

export default function SignUp() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-kingdom-gold/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:border-kingdom-gold/40 focus:outline-none focus:bg-white/8 transition-all"

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <AmbientBackground world="kingdom" />

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="text-white/30 hover:text-kingdom-gold/60 mb-8 text-sm transition-colors"
        >
          ← Back
        </button>

        {/* Ornamental header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-kingdom-gold/30" />
          <span className="text-kingdom-gold/30 text-xs">✦</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-shimmer mb-2">
          Welcome Back
        </h1>
        <p className="text-white/40 mb-8 text-sm">
          Enter your realm with your sealed scroll.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-kingdom-gold/40 text-xs uppercase tracking-wider mb-1.5 block font-display">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-kingdom-gold/40 text-xs uppercase tracking-wider mb-1.5 block font-display">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full text-lg mt-4 disabled:opacity-50 relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? 'Loading...' : 'Enter'}</span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>
        </form>

        <p className="text-white/25 text-sm text-center mt-6">
          New to the realm? <button onClick={() => navigate('/gate')} className="text-kingdom-gold/70 hover:text-kingdom-gold transition-colors">Step through the gate</button>
        </p>
      </div>
    </div>
  )
}
