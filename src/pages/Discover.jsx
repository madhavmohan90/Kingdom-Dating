import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import MatchCelebration from '../components/MatchCelebration'
import { worldMeta } from '../data/prompts'

export default function Discover() {
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [audioLoading, setAudioLoading] = useState(false)
  const [matchData, setMatchData] = useState(null)
  const [myWorld, setMyWorld] = useState('kingdom')
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const audioRef = useRef(null)
  const touchStart = useRef(null)

  useEffect(() => {
    loadProfiles()
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('gender, selected_world')
        .eq('id', user.id)
        .single()

      if (!myProfile) return

      setMyWorld(myProfile.selected_world || 'kingdom')
      const oppositeGender = myProfile.gender === 'female' ? 'male' : 'female'

      // Get profiles user hasn't liked/skipped yet
      const { data: existingLikes } = await supabase
        .from('likes')
        .select('liked_id')
        .eq('liker_id', user.id)

      const likedIds = (existingLikes || []).map(l => l.liked_id)

      let query = supabase
        .from('profiles')
        .select(`
          id, name, age, archetype, selected_world,
          voice_recordings ( id, prompt_id, storage_path, is_primary, duration_seconds )
        `)
        .eq('gender', oppositeGender)
        .eq('selected_world', myProfile.selected_world || 'kingdom')
        .neq('id', user.id)
        .limit(20)

      if (likedIds.length > 0) {
        query = query.not('id', 'in', `(${likedIds.join(',')})`)
      }

      const { data } = await query

      // Only show profiles that have at least one voice recording
      const withRecordings = (data || []).filter(
        p => p.voice_recordings && p.voice_recordings.length > 0
      )

      setProfiles(withRecordings)
    } catch (err) {
      console.error('Error loading profiles:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentProfile = profiles[currentIndex]

  const playAudio = async (storagePath) => {
    try {
      // Stop current audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
        if (isPlaying) {
          setIsPlaying(false)
          return
        }
      }

      setAudioLoading(true)

      // Get signed URL from Supabase Storage
      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .createSignedUrl(storagePath, 300) // 5 min expiry

      if (error) throw error

      const audio = new Audio(data.signedUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
      }

      audio.oncanplay = () => {
        setAudioLoading(false)
      }

      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('Error playing audio:', err)
      setAudioLoading(false)
    }
  }

  const handleLike = async () => {
    if (!currentProfile) return

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('likes').insert({
        liker_id: user.id,
        liked_id: currentProfile.id,
      })

      // Check if a match was created (mutual like triggers auto-match)
      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${currentProfile.id}),and(user1_id.eq.${currentProfile.id},user2_id.eq.${user.id})`)
        .maybeSingle()

      if (match) {
        setMatchData({
          matchId: match.id,
          otherUser: currentProfile,
        })
        return // Don't advance yet — celebration screen will handle it
      }
    }

    nextProfile()
  }

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
    nextProfile()
  }

  const nextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsPlaying(false)
    } else {
      setCurrentIndex(profiles.length) // triggers "no more" state
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

  // Swipe handlers
  const handleTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (touchStart.current === null) return
    const diff = e.touches[0].clientX - touchStart.current
    setSwipeOffset(diff)
    setSwiping(true)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(swipeOffset) > 100) {
      if (swipeOffset > 100) {
        // Swiped right → Like
        handleLike()
      } else {
        // Swiped left → Skip
        handleSkip()
      }
    }
    setSwipeOffset(0)
    setSwiping(false)
    touchStart.current = null
  }, [swipeOffset])

  const meta = worldMeta[myWorld] || worldMeta.kingdom

  if (loading) {
    return (
      <div className={`min-h-screen ${meta.bgClass} flex items-center justify-center pb-20`}>
        <div className="text-kingdom-gold animate-pulse font-display text-xl">
          Entering {meta.name}...
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className={`min-h-screen ${meta.bgClass} flex flex-col items-center justify-center px-6 pb-20 text-center`}>
        <div className="text-5xl mb-4">{meta.emoji}</div>
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
    || currentProfile.voice_recordings?.[0]

  return (
    <div className={`min-h-screen ${meta.bgClass} px-6 pt-12 pb-24`}>
      <div className="max-w-md mx-auto">
        {/* World header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-white/40 text-xs tracking-wider uppercase">Exploring</p>
            <h1 className="font-display text-xl text-kingdom-gold">{meta.name}</h1>
          </div>
          <span className="text-2xl">{meta.emoji}</span>
        </div>

        {/* Voice card — swipeable */}
        <div
          className="card-dark animate-fade-in"
          key={currentProfile.id}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: swiping ? `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.05}deg)` : 'none',
            transition: swiping ? 'none' : 'transform 0.3s ease',
            opacity: swiping ? Math.max(0.5, 1 - Math.abs(swipeOffset) / 300) : 1,
          }}
        >
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
                  onClick={() => playAudio(primaryRecording.storage_path)}
                  disabled={audioLoading}
                  className="w-16 h-16 rounded-full bg-kingdom-gold flex items-center justify-center mb-4 hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {audioLoading ? (
                    <div className="w-5 h-5 border-2 border-kingdom-darker border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
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
                  {isPlaying ? 'Playing...' : 'Tap to listen to their quest response'}
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
              Like Voice
            </button>
          </div>
        </div>

        {/* Counter + swipe hint */}
        <p className="text-white/20 text-xs text-center mt-4">
          {currentIndex + 1} of {profiles.length} voices
        </p>
        <p className="text-white/10 text-[10px] text-center mt-1">
          ← swipe left to skip · swipe right to like →
        </p>

        {/* Swipe indicator overlay */}
        {swiping && Math.abs(swipeOffset) > 50 && (
          <div className="fixed top-1/3 left-0 right-0 flex justify-center pointer-events-none z-40">
            <div className={`text-4xl font-display px-6 py-3 rounded-2xl ${
              swipeOffset > 50
                ? 'bg-kingdom-gold/20 text-kingdom-gold border border-kingdom-gold/40'
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {swipeOffset > 50 ? '♥ Like' : '✕ Skip'}
            </div>
          </div>
        )}
      </div>

      {/* Match celebration overlay */}
      {matchData && (
        <MatchCelebration
          matchData={matchData}
          onClose={() => {
            setMatchData(null)
            nextProfile()
          }}
        />
      )}
    </div>
  )
}
