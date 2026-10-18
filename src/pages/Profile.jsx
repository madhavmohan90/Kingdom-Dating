import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { worldMeta } from '../data/prompts'
import AmbientBackground from '../components/AmbientBackground'

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

  const getArchetypeDisplay = (archetype) => {
    const map = {
      protector: { emoji: '🛡️', name: 'The Protector', title: 'Guardian of the Realm' },
      genius: { emoji: '🧠', name: 'The Genius', title: 'Keeper of Forbidden Knowledge' },
      rebel: { emoji: '⚡', name: 'The Rebel', title: 'Breaker of Chains' },
      romantic: { emoji: '🌹', name: 'The Romantic', title: 'Voice of the Heart' },
      commander: { emoji: '👑', name: 'The Commander', title: 'Ruler of Destiny' },
      adventurer: { emoji: '🗺️', name: 'The Adventurer', title: 'Walker Between Worlds' },
      healer: { emoji: '✨', name: 'The Healer', title: 'Mender of Souls' },
      wildcard: { emoji: '🃏', name: 'The Wildcard', title: 'Trickster of the Court' },
    }
    return map[archetype] || { emoji: '❓', name: 'Unknown', title: '' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-kingdom flex items-center justify-center pb-20 relative overflow-hidden">
        <AmbientBackground world="kingdom" />
        <div className="text-kingdom-gold animate-pulse relative z-10">Loading...</div>
      </div>
    )
  }

  const archetype = getArchetypeDisplay(profile?.archetype)
  const world = profile?.selected_world || 'kingdom'
  const wMeta = worldMeta[world] || worldMeta.kingdom

  return (
    <div className="min-h-screen bg-gradient-kingdom px-6 pt-12 pb-24 relative overflow-hidden">
      <AmbientBackground world={world} />

      <div className="max-w-md mx-auto relative z-10">
        {/* Header with ornament */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl text-shimmer">Your Profile</h1>
          <span className="text-kingdom-gold/20 text-xs tracking-[0.3em]">✦</span>
        </div>

        {/* Archetype card */}
        <div className="card-ornate text-center mb-6">
          <div className="text-5xl mb-3 animate-float-slow">{archetype.emoji}</div>
          <h2 className="font-display text-xl text-shimmer mb-1">
            {archetype.name}
          </h2>
          <p className="text-white/40 text-sm italic mb-4">
            {archetype.title}
          </p>
          <div className="divider-ornate mb-4">✦</div>
          <p className="text-white font-medium">{profile?.name}</p>
          {profile?.selected_world && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-kingdom-gold/5 border border-kingdom-gold/15">
              <span className="text-sm">{wMeta.emoji}</span>
              <span className="text-kingdom-gold/60 text-xs font-display">{wMeta.name}</span>
            </div>
          )}
        </div>

        {/* Voice recordings */}
        <div className="card-ornate mb-6">
          <h3 className="text-kingdom-gold/50 text-sm font-display tracking-wide mb-4">
            Voice Recordings ({recordings.length})
          </h3>

          {recordings.length > 0 && (
            <div className="space-y-2 mb-4">
              {recordings.map(rec => (
                <button
                  key={rec.id}
                  onClick={() => playRecording(rec)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    playingId === rec.id
                      ? 'bg-kingdom-gold/10 border border-kingdom-gold/25'
                      : 'bg-white/3 border border-white/5 hover:bg-white/5 hover:border-kingdom-gold/10'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    playingId === rec.id ? 'bg-gradient-gold pulse-ring' : 'bg-white/10'
                  }`}>
                    {playingId === rec.id ? (
                      <svg className="w-3.5 h-3.5 text-kingdom-darker" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm truncate">{rec.prompt_id}</p>
                    <p className="text-white/30 text-xs">
                      {rec.is_primary ? '★ Primary' : 'Quest response'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/voice-record')}
            className="w-full py-3 rounded-xl border border-dashed border-kingdom-gold/15 text-kingdom-gold/40 text-sm hover:border-kingdom-gold/30 hover:text-kingdom-gold/60 transition-all"
          >
            + Record a new quest response
          </button>
        </div>

        {/* Seal your scroll — only for nameless (anonymous) accounts */}
        {isAnonymous && (
          <div className="card-ornate mb-6">
            <h3 className="text-kingdom-gold/70 text-sm font-display tracking-wide mb-1">📜 Seal your scroll</h3>
            <p className="text-white/40 text-xs mb-4 leading-relaxed">
              Your place in the realm is kept only on this device. Seal it with an email so you never lose your voice or your matches.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                value={sealEmail}
                onChange={e => setSealEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-kingdom-gold/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:border-kingdom-gold/40 focus:outline-none"
              />
              <input
                type="password"
                value={sealPassword}
                onChange={e => setSealPassword(e.target.value)}
                minLength={6}
                placeholder="A secret word (6+ characters)"
                className="w-full bg-white/5 border border-kingdom-gold/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:border-kingdom-gold/40 focus:outline-none"
              />
              {sealMsg && <p className="text-kingdom-gold/70 text-xs">{sealMsg}</p>}
              <button
                onClick={sealScroll}
                disabled={sealing || !sealEmail || sealPassword.length < 6}
                className="btn-gold w-full disabled:opacity-40"
              >
                {sealing ? 'Sealing...' : 'Seal'}
              </button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="card-ornate mb-6">
          <h3 className="text-kingdom-gold/50 text-sm font-display tracking-wide mb-4">Settings</h3>
          <div className="space-y-1">
            {[
              { label: 'Edit Your Legend', path: '/edit-profile' },
              { label: 'Retake Quiz', path: '/quiz' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between py-3 px-1 text-white/50 hover:text-kingdom-gold/70 text-sm transition-colors border-b border-white/5 last:border-0"
              >
                <span>{item.label}</span>
                <span className="text-kingdom-gold/30">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            if (isAnonymous && !window.confirm('Your scroll is not sealed. If you leave, this account is lost forever. Leave anyway?')) return
            handleLogout()
          }}
          className="w-full text-center text-red-400/40 text-sm hover:text-red-400/70 transition-colors py-3"
        >
          Leave the Kingdom
        </button>
      </div>
    </div>
  )
}
