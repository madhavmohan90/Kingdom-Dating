import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { worldMeta } from '../data/prompts'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [recordings, setRecordings] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    loadProfile()
    return () => { if (audioRef.current) audioRef.current.pause() }
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)

      // Load user's recordings
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
      <div className="min-h-screen bg-gradient-kingdom flex items-center justify-center pb-20">
        <div className="text-kingdom-gold animate-pulse">Loading...</div>
      </div>
    )
  }

  const archetype = getArchetypeDisplay(profile?.archetype)

  return (
    <div className="min-h-screen bg-gradient-kingdom px-6 pt-12 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-2xl text-kingdom-gold mb-8">
          Your Profile
        </h1>

        {/* Archetype card */}
        <div className="card-dark text-center mb-6">
          <div className="text-5xl mb-3">{archetype.emoji}</div>
          <h2 className="font-display text-xl text-kingdom-gold mb-1">
            {archetype.name}
          </h2>
          <p className="text-white/40 text-sm italic mb-4">
            {archetype.title}
          </p>
          <div className="border-t border-white/10 pt-4 mt-4">
            <p className="text-white font-medium">{profile?.name}</p>
            <p className="text-white/40 text-sm">{profile?.age} years old</p>
            {profile?.selected_world && (
              <p className="text-white/30 text-xs mt-1">
                {(worldMeta[profile.selected_world] || worldMeta.kingdom).emoji}{' '}
                {(worldMeta[profile.selected_world] || worldMeta.kingdom).name}
              </p>
            )}
          </div>
        </div>

        {/* Voice recordings */}
        <div className="card-dark mb-6">
          <h3 className="text-white/60 text-sm font-medium mb-4">
            Your Voice Recordings ({recordings.length})
          </h3>

          {recordings.length > 0 && (
            <div className="space-y-2 mb-4">
              {recordings.map(rec => (
                <button
                  key={rec.id}
                  onClick={() => playRecording(rec)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    playingId === rec.id
                      ? 'bg-kingdom-gold/15 border border-kingdom-gold/30'
                      : 'bg-white/5 border border-white/5 hover:bg-white/8'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    playingId === rec.id ? 'bg-kingdom-gold' : 'bg-white/10'
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
            className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/40 text-sm hover:border-kingdom-gold/30 hover:text-kingdom-gold/60 transition-colors"
          >
            + Record a new quest response
          </button>
        </div>

        {/* Settings */}
        <div className="card-dark mb-6">
          <h3 className="text-white/60 text-sm font-medium mb-4">Settings</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/edit-profile')}
              className="w-full flex items-center justify-between py-2 text-white/60 hover:text-white/80 text-sm"
            >
              <span>Edit Profile</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/world-select')}
              className="w-full flex items-center justify-between py-2 text-white/60 hover:text-white/80 text-sm"
            >
              <span>Change World</span>
              <span>→</span>
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="w-full flex items-center justify-between py-2 text-white/60 hover:text-white/80 text-sm"
            >
              <span>Retake Quiz</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full text-center text-red-400/60 text-sm hover:text-red-400 transition-colors py-3"
        >
          Leave the Kingdom
        </button>
      </div>
    </div>
  )
}
