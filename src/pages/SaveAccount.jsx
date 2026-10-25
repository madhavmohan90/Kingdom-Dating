// Shown once after the three trials: offer to save the account with an email.
// Optional — "Later" goes straight to the voices.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AmbientBackground from '../components/AmbientBackground'

export default function SaveAccount() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const save = async () => {
    setSaving(true)
    setMsg('')
    const { error } = await supabase.auth.updateUser({ email, password })
    if (error) setMsg(error.message)
    else { setDone(true); setMsg('Saved. Check your email and tap the link to confirm.') }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <AmbientBackground world="kingdom" />
      <div className="w-full max-w-md relative z-10 text-center">
        <div className="text-5xl mb-4 animate-float-slow">📜</div>
        <h1 className="font-display text-2xl text-shimmer mb-2">Save your account</h1>
        <p className="text-white/60 text-sm mb-8 leading-relaxed">
          Your voice is in the realm. Add an email so you never lose it, your matches, or your chats — even on a new phone.
        </p>

        {!done ? (
          <div className="space-y-3 text-left">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-white/5 border border-kingdom-gold/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-kingdom-gold/50 focus:outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password (6+ characters)"
              className="w-full bg-white/5 border border-kingdom-gold/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:border-kingdom-gold/50 focus:outline-none"
            />
            {msg && <p className="text-red-300 text-sm">{msg}</p>}
            <button
              onClick={save}
              disabled={saving || !email.includes('@') || password.length < 6}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save my account'}
            </button>
          </div>
        ) : (
          <p className="text-kingdom-gold/90 text-sm mb-2">✓ {msg}</p>
        )}

        <button
          onClick={() => navigate('/worlds', { replace: true })}
          className={done ? 'btn-gold w-full mt-6' : 'text-white/55 text-sm mt-6 hover:text-white/80'}
        >
          {done ? 'Enter the realm →' : 'Later — take me to the voices'}
        </button>
      </div>
    </div>
  )
}
