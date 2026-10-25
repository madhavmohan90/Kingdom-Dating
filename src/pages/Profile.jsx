import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getQuest } from '../data/prompts'
import AmbientBackground from '../components/AmbientBackground'
import EmberBar from '../components/EmberBar'
import { narrate } from '../lib/narrator'
import { isRiddleId } from '../data/gamification'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [sealEmail, setSealEmail] = useState('')
  const [sealPassword, setSealPassword] = useState('')
  const [sealMsg, setSealMsg] = useState('')
  const [sealing, setSealing] = useState(false)
  const [progress, setProgress] = useState(null)
  const [badgeHint, setBadgeHint] = useState(null)
  const [showSeal, setShowSeal] = useState(false)
  const [searchParams] = useSearchParams()
  const testMode = searchParams.get('test') === '1'

  useEffect(() => {
    loadProfile()
    return () => { if (audioRef.current) audioRef.current.pause() }
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setIsAnonymous(!!user.is_anonymous)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)

      const { data: recs } = await supabase
        .from('voice_recordings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setRecordings(recs || [])
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const sealScroll = async () => {
    setSealing(true)
    setSealMsg('')
    const { error } = await supabase.auth.updateUser({ email: sealEmail, password: sealPassword })
    if (error) setSealMsg(error.message)
    else setSealMsg('A raven is on its way. Open the link in your email to seal your scroll.')
    setSealing(false)
  }

  const playRecording = async (rec) => {
    try {
      if (audioRef.current && playingId === rec.id) {
        audioRef.current.pause()
        audioRef.current = null
        setPlayingId(null)
        return
      }
      if (audioRef.current) audioRef.current.pause()

      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .createSignedUrl(rec.storage_path, 300)

      if (error) throw error

      const audio = new Audio(data.signedUrl)
      audioRef.current = audio
      audio.onended = () => setPlayingId(null)
      await audio.play()
      setPlayingId(rec.id)
    } catch (err) {
      console.error('Error playing recording:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-kingdom flex items-center justify-center pb-20 relative overflow-hidden">
        <AmbientBackground world="kingdom" />
        <div className="text-kingdom-gold animate-pulse relative z-10">Loading...</div>
      </div>
    )
  }

  // Your current answers: newest per trial question, riddles left out, max 3
  const seen = new Set()
  const myAnswers = recordings
    .filter(r => !isRiddleId(r.prompt_id))
    .filter(r => !seen.has(r.prompt_id) && seen.add(r.prompt_id))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-kingdom px-6 pt-12 pb-24 relative overflow-hidden">
      <AmbientBackground world="kingdom" />

      <div className="max-w-md mx-auto relative z-10 space-y-5">
        {/* Who you are */}
        <div className="card-ornate text-center">
          <div className="text-5xl mb-2 animate-float-slow">{profile?.gender === 'female' ? '🌙' : '⚔️'}</div>
          <h1 className="font-display text-2xl text-shimmer">{profile?.name || 'Wanderer'}</h1>
          <p className="text-white/40 text-sm italic mb-1">
            {profile?.gender === 'female' ? 'A Queen of the night' : 'A King of the night'}
          </p>
          {profile?.bio && <p className="text-white/60 text-sm italic mt-2">"{profile.bio}"</p>}

          <div className="mt-5 text-left">
            <EmberBar onLoaded={setProgress} />
          </div>

          {progress && (
            <>
              <div className="flex justify-center gap-2 mt-4">
                {progress.badges.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBadgeHint(badgeHint?.id === b.id ? null : b)}
                    aria-label={b.name}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border transition-all
                      ${b.has ? 'border-kingdom-gold/40 bg-kingdom-gold/10' : 'border-white/10 opacity-30 grayscale'}
                      ${badgeHint?.id === b.id ? 'scale-110 border-kingdom-gold' : ''}`}
                  >
                    {b.emoji}
                  </button>
                ))}
              </div>
              <p className="text-white/50 text-xs mt-2 min-h-[1rem]">
                {badgeHint
                  ? `${badgeHint.name} · ${badgeHint.has ? 'earned' : badgeHint.hint}`
                  : `${progress.badges.filter(b => b.has).length} of ${progress.badges.length} badges · tap one`}
              </p>
            </>
          )}
        </div>

        {/* Your voice */}
        <div className="card-ornate">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-kingdom-gold/70 text-sm font-display tracking-wide">Your voice</h3>
            <button onClick={() => navigate('/voice-record')} className="text-kingdom-gold/60 text-xs hover:text-kingdom-gold">
              Re-record
            </button>
          </div>

          {myAnswers.length === 0 ? (
            <button onClick={() => navigate('/voice-record')} className="btn-gold w-full text-sm">
              Answer your three trials
            </button>
          ) : (
            <div className="space-y-2">
              {myAnswers.map(rec => {
                const q = getQuest(rec.prompt_id)
                const playing = playingId === rec.id
                return (
                  <button
                    key={rec.id}
                    onClick={() => playRecording(rec)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border transition-all
                      ${playing ? 'bg-kingdom-gold/10 border-kingdom-gold/30' : 'bg-white/3 border-white/5 hover:border-kingdom-gold/15'}`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs
                      ${playing ? 'bg-gradient-gold text-kingdom-darker' : 'bg-white/10 text-white/70'}`}>
                      {playing ? '❚❚' : '▶'}
                    </span>
                    <span className="text-white/75 text-sm truncate">{q.text}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Save account — only for accounts without email, folded until tapped */}
        {isAnonymous && (
          <div className="card-ornate">
            {!showSeal ? (
              <button onClick={() => setShowSeal(true)} className="w-full flex items-center justify-between text-left">
                <span>
                  <span className="block text-kingdom-gold/80 text-sm font-display">📜 Save your account</span>
                  <span className="block text-white/50 text-xs">Add an email so you never lose your voice and matches</span>
                </span>
                <span className="text-kingdom-gold/60">→</span>
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-kingdom-gold/80 text-sm font-display">📜 Save your account</p>
                <input
                  type="email"
                  value={sealEmail}
                  onChange={e => setSealEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-kingdom-gold/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/40 focus:border-kingdom-gold/40 focus:outline-none"
                />
                <input
                  type="password"
                  value={sealPassword}
                  onChange={e => setSealPassword(e.target.value)}
                  minLength={6}
                  placeholder="Password (6+ characters)"
                  className="w-full bg-white/5 border border-kingdom-gold/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/40 focus:border-kingdom-gold/40 focus:outline-none"
                />
                {sealMsg && <p className="text-kingdom-gold/80 text-xs">{sealMsg}</p>}
                <button
                  onClick={sealScroll}
                  disabled={sealing || !sealEmail || sealPassword.length < 6}
                  className="btn-gold w-full disabled:opacity-40"
                >
                  {sealing ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Narrator test buttons — only with ?test=1 in the address */}
        {testMode && (
          <div className="card-ornate">
            <h3 className="text-kingdom-gold/70 text-sm font-display mb-3">🔊 Narrator (test)</h3>
            <div className="grid grid-cols-2 gap-2">
              {['welcome', 'trials-intro', 'riddle', 'match'].map(k => (
                <button key={k} onClick={() => narrate(k)}
                        className="py-2 rounded-xl border border-kingdom-gold/15 text-white/70 text-xs hover:text-kingdom-gold">
                  ▶ {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Small links */}
        <div className="flex justify-center gap-6 pt-2 text-sm">
          <button onClick={() => navigate('/edit-profile')} className="text-white/50 hover:text-kingdom-gold/80">
            Edit bio
          </button>
          <button
            onClick={() => {
              if (isAnonymous && !window.confirm('Your account is not saved with an email. If you leave, it is lost forever. Leave anyway?')) return
              handleLogout()
            }}
            className="text-red-400/60 hover:text-red-400"
          >
            Leave the Kingdom
          </button>
        </div>
      </div>
    </div>
  )
}
