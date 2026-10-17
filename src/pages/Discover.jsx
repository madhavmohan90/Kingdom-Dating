import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Discover() {
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's gender to show opposite gender
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('gender, selected_world')
        .eq('id', user.id)
        .single()

      if (!myProfile) return

      const oppositeGender = myProfile.gender === 'female' ? 'male' : 'female'

      // Fetch profiles with voice recordings
      const { data } = await supabase
        .from('profiles')
        .select(`
          id, name, age, archetype, selected_world,
          voice_recordings ( id, prompt_id, storage_path, is_primary )
        `)
        .eq('gender', oppositeGender)
        .eq('selected_world', myProfile.selected_world || 'kingdom')
        .limit(20)

      setProfiles(data || [])
    } catch (err) {
      console.error('Error loading profiles:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentProfile = profiles[currentIndex]

  const handleLike = async () => {
    if (!currentProfile) return

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('likes').insert({
        liker_id: user.id,
        liked_id: currentProfile.id,
      })
    }

    nextProfile()
  }

  const handleSkip = () => {
    nextProfile()
  }

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsPlaying(false)
    }
  }

  const getArchetypeDisplay = (archetype) => {
    const map = {
      protector: { emoji: '🛡️', name: 'The Protector' },
      genius: { emoji: '🧠', name: 'The Genius' },
      rebel: { emoji: '⚡', name: 'The Rebel' },
      romantic: { emoji: '🌹', name: 'The Romantic' },
      commander: { emoji: '👑', name: 'The Commander' },
      adventurer: { emoji: '🗺️', name: 'The Adventurer' },
      healer: { emoji: '✨', name: 'The Healer' },
      wildcard: { emoji: '🃏', name: 'The Wildcard' },
    }
    return map[archetype] || { emoji: '❓', name: 'Unknown' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-kingdom flex items-center justify-center pb-20">
        <div className="text-kingdom-gold animate-pulse font-display text-xl">
          Entering the Kingdom...
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-kingdom flex flex-col items-center justify-center px-6 pb-20 text-center">
        <div className="text-5xl mb-4">🏰</div>
        <h2 className="font-display text-2xl text-kingdom-gold mb-3">
          The Realm Awaits
        </h2>
        <p className="text-white/50 text-sm max-w-xs">
          No new voices in your world right now. Check back soon — new quests arrive daily.
        </p>
      </div>
    )
  }

  const archetype = getArchetypeDisplay(currentProfile.archetype)
  const primaryRecording = currentProfile.voice_recordings?.find(r => r.is_primary)

  return (
    <div className="min-h-screen bg-gradient-kingdom px-6 pt-12 pb-24">
      <div className="max-w-md mx-auto">
        {/* World header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-white/40 text-xs tracking-wider uppercase">Exploring</p>
            <h1 className="font-display text-xl text-kingdom-gold">The Kingdom</h1>
          </div>
          <span className="text-2xl">🏰</span>
        </div>

        {/* Voice card */}
        <div className="card-dark animate-fade-in" key={currentProfile.id}>
          {/* Archetype badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">{archetype.emoji}</span>
            <div>
              <p className="text-white/80 font-medium text-sm">{archetype.name}</p>
              <p className="text-white/40 text-xs">{currentProfile.name}, {currentProfile.age}</p>
            </div>
          </div>

          {/* Audio player area */}
          <div className="bg-white/5 rounded-xl p-6 mb-6 flex flex-col items-center">
            {primaryRecording ? (
              <>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-kingdom-gold flex items-center justify-center mb-4 hover:scale-105 transition-transform"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-kingdom-darker" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-kingdom-darker ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Waveform visualization */}
                <div className="flex gap-1 items-end h-8">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isPlaying ? 'bg-kingdom-gold waveform-bar' : 'bg-white/20'
                      }`}
                      style={{
                        height: isPlaying ? undefined : `${4 + Math.random() * 20}px`,
                        animationDelay: `${i * 0.08}s`
                      }}
                    />
                  ))}
                </div>

                <p className="text-white/30 text-xs mt-3">
                  Listen to their quest response
                </p>
              </>
            ) : (
              <p className="text-white/30 text-sm py-4">
                No voice recording yet
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:bg-white/5 transition-colors text-sm font-medium"
            >
              Skip
            </button>
            <button
              onClick={handleLike}
              className="flex-1 btn-gold text-sm"
            >
              💛 Like Voice
            </button>
          </div>
        </div>

        {/* Counter */}
        <p className="text-white/20 text-xs text-center mt-4">
          {currentIndex + 1} of {profiles.length} voices
        </p>
      </div>
    </div>
  )
}
