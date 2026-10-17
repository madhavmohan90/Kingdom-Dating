import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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

        // Create profile in profiles table
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

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="text-white/40 hover:text-white/60 mb-8 text-sm"
        >
          ← Back
        </button>

        <h1 className="font-display text-3xl font-bold text-kingdom-gold mb-2">
          {isLogin ? 'Welcome Back' : 'Begin Your Quest'}
        </h1>
        <p className="text-white/50 mb-8">
          {isLogin ? 'Enter your realm.' : 'Create your identity in the Kingdom.'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="text-white/60 text-sm mb-1 block">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="What shall we call you?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-kingdom-gold/50 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Gender</label>
                <div className="flex gap-3">
                  {['Male', 'Female'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g.toLowerCase())}
                      className={`flex-1 py-3 rounded-xl border transition-colors text-sm font-medium
                        ${gender === g.toLowerCase()
                          ? 'bg-kingdom-gold/20 border-kingdom-gold text-kingdom-gold'
                          : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
                        }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-1 block">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  required
                  min="18"
                  max="65"
                  placeholder="Your age"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-kingdom-gold/50 focus:outline-none transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-white/60 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-kingdom-gold/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-kingdom-gold/50 focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full text-lg mt-4 disabled:opacity-50"
          >
            {loading ? 'Loading...' : isLogin ? 'Enter' : 'Continue to Quiz'}
          </button>
        </form>

        <p className="text-white/30 text-sm text-center mt-6">
          {isLogin ? (
            <>Don't have an account? <button onClick={() => navigate('/signup')} className="text-kingdom-gold hover:underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => navigate('/signup?mode=login')} className="text-kingdom-gold hover:underline">Log in</button></>
          )}
        </p>
      </div>
    </div>
  )
}
