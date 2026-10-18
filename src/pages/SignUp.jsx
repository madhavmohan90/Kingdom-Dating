import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AmbientBackground from '../components/AmbientBackground'

export default function SignUp() {
  const [searchParams] = useSearchParams()
  const isLogin = searchParams.get('mode') === 'login'
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/worlds')
      } else {
        if (!gender) {
          setError('Please select your gender')
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, gender, age: parseInt(age) }
          }
        })
        if (error) throw error

        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            name,
            gender,
            age: parseInt(age),
          })
        }

        navigate('/quiz')
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
          {isLogin ? 'Welcome Back' : 'Begin Your Quest'}
        </h1>
        <p className="text-white/40 mb-8 text-sm">
          {isLogin ? 'Enter your realm.' : 'Create your identity in the Kingdom.'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="text-kingdom-gold/40 text-xs uppercase tracking-wider mb-1.5 block font-display">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="What shall we call you?"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-kingdom-gold/40 text-xs uppercase tracking-wider mb-2 block font-display">Gender</label>
                <div className="flex gap-3">
                  {['Male', 'Female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g.toLowerCase())}
                      className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium
                        ${gender === g.toLowerCase()
                          ? 'bg-kingdom-gold/15 border-kingdom-gold/40 text-kingdom-gold'
                          : 'bg-white/5 border-kingdom-gold/10 text-white/40 hover:border-kingdom-gold/20'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-kingdom-gold/40 text-xs uppercase tracking-wider mb-1.5 block font-display">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  required
                  min="18"
                  max="65"
                  placeholder="Your age"
                  className={inputClass}
                />
              </div>
            </>
          )}

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
            <span className="relative z-10">{loading ? 'Loading...' : isLogin ? 'Enter' : 'Continue to Quiz'}</span>
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </button>
        </form>

        <p className="text-white/25 text-sm text-center mt-6">
          {isLogin ? (
            <>Don't have an account? <button onClick={() => navigate('/signup')} className="text-kingdom-gold/70 hover:text-kingdom-gold transition-colors">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => navigate('/signup?mode=login')} className="text-kingdom-gold/70 hover:text-kingdom-gold transition-colors">Log in</button></>
          )}
        </p>
      </div>
    </div>
  )
}
