import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import MatchCelebration from '../components/MatchCelebration'
import AmbientBackground from '../components/AmbientBackground'
import { getQuest } from '../data/prompts'
import { useNavigate } from 'react-router-dom'
import EmberBar from '../components/EmberBar'
import EmberToast from '../components/EmberToast'
import { EMBERS } from '../data/gamification'
import { narrate } from '../lib/narrator'

export default function Discover() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playingPath, setPlayingPath] = useState(null)
  const isPlaying = playingPath !== null
  const setIsPlaying = v => { if (!v) setPlayingPath(null) }
  const [loading, setLoading] = useState(true)
  const [audioLoading, setAudioLoading] = useState(false)
  const [matchData, setMatchData] = useState(null)
  const [myWorld, setMyWorld] = useState('kingdom')
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [answerIdx, setAnswerIdx] = useState(0)
  const [riddleDone, setRiddleDone] = useState(true)
  const [toast, setToast] = useState(null)
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

      // Nobody browses until they have spoken
      const { count: myVoices } = await supabase
        .from('voice_recordings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      if (!myVoices) { navigate('/voice-record', { replace: true }); return }

      setMyWorld(myProfile.selected_world || 'kingdom')
      const oppositeGender = myProfile.gender === 'female' ? 'male' : 'female'

      const { data: existingLikes } = await supabase
        .from('likes')
        .select('liked_id')
        .eq('liker_id', user.id)

      const likedIds = (existingLikes || []).map(l => l.liked_id)

      let query = supabase
        .from('profiles')
        .select(`
          id, name, archetype, selected_world,
          voice_recordings ( id, prompt_id, storage_path, is_primary, created_at )
        `)
        .eq('gender', oppositeGender)
        .neq('id', user.id)
        .limit(20)

      if (likedIds.length > 0) {
        query = query.not('id', 'in', `(${likedIds.join(',')})`)
      }

      const { data } = await query

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
      const wasPlaying = playingPath
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
        setPlayingPath(null)
        if (wasPlaying === storagePath) return
      }

      setAudioLoading(storagePath)
      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .createSignedUrl(storagePath, 300)
      if (error) throw error

      const audio = new Audio(data.signedUrl)
      audioRef.current = audio
      audio.onended = () => setPlayingPath(null)
      await audio.play()
      setAudioLoading(false)
      setPlayingPath(storagePath)
    } catch (err) {
      console.error('Error playing audio:', err)
      setAudioLoading(false)
    }
  }

  const handleLike = async () => {
    if (!currentProfile) return

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
      setToast({ amount: EMBERS.like, label: 'Brave heart' })
      setTimeout(() => setToast(null), 1500)

      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${currentProfile.id}),and(user1_id.eq.${currentProfile.id},user2_id.eq.${user.id})`)
        .maybeSingle()

      if (match) {
        narrate('match')
        setMatchData({ matchId: match.id, otherUser: currentProfile })
        return
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
    setAnswerIdx(0)
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsPlaying(false)
    } else {
      setCurrentIndex(profiles.length)
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
      if (swipeOffset > 100) handleLike()
      else handleSkip()
    }
    setSwipeOffset(0)
    setSwiping(false)
    touchStart.current = null
  }, [swipeOffset])

  const meta = { bgClass: 'bg-gradient-kingdom' }

  if (loading) {
    return (
      <div className={`min-h-screen ${meta.bgClass} flex items-center justify-center pb-20 relative overflow-hidden`}>
        <AmbientBackground world={myWorld} />
        <div className="text-kingdom-gold animate-pulse font-display text-xl relative z-10">
          Entering the dark...
        </div>
      </div>
    )
  }

  if (!currentProfile) {
    return (
      <div className={`min-h-screen ${meta.bgClass} flex flex-col items-center justify-center px-6 pb-20 text-center relative overflow-hidden`}>
        <AmbientBackground world={myWorld} />
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8"><EmberBar onLoaded={pr => setRiddleDone(pr.riddleDoneToday)} /></div>
          {!riddleDone && (
            <button
              onClick={() => navigate('/voice-record?daily=1')}
              className="w-full text-left mb-6 p-4 rounded-2xl border border-kingdom-gold/30 bg-kingdom-gold/5 hover:bg-kingdom-gold/10 transition-all animate-fade-in"
            >
              <p className="text-kingdom-gold/60 text-[10px] uppercase tracking-[0.3em] font-display mb-1">🌙 Tonight's Riddle · +{EMBERS.riddle} embers</p>
              <p className="text-white/80 text-sm font-display">A new question waits. Answer it with your voice →</p>
            </button>
          )}
          <div className="text-6xl mb-6 animate-float-slow">🐉</div>
          <h2 className="font-display text-2xl text-shimmer mb-3">
            The Night Is Quiet
          </h2>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            No new voices right now. New souls arrive every day — come back soon.
          </p>
          <div className="divider-ornate mt-8 max-w-[200px] mx-auto">✦</div>
        </div>
      </div>
    )
  }

  // Newest answer per question, at most three
  const seen = new Set()
  const recordings = [...(currentProfile.voice_recordings || [])]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter(r => !seen.has(r.prompt_id) && seen.add(r.prompt_id))
    .slice(0, 3)
  const rec = recordings[Math.min(answerIdx, recordings.length - 1)]
  const q = rec ? getQuest(rec.prompt_id) : null

  return (
    <div className={`min-h-screen ${meta.bgClass} px-6 pt-12 pb-24 relative overflow-hidden`}>
      <AmbientBackground world={myWorld} />

      <div className="max-w-md mx-auto relative z-10">
        <div className="mb-6"><EmberBar onLoaded={pr => setRiddleDone(pr.riddleDoneToday)} /></div>
          {!riddleDone && (
            <button
              onClick={() => navigate('/voice-record?daily=1')}
              className="w-full text-left mb-6 p-4 rounded-2xl border border-kingdom-gold/30 bg-kingdom-gold/5 hover:bg-kingdom-gold/10 transition-all animate-fade-in"
            >
              <p className="text-kingdom-gold/60 text-[10px] uppercase tracking-[0.3em] font-display mb-1">🌙 Tonight's Riddle · +{EMBERS.riddle} embers</p>
              <p className="text-white/80 text-sm font-display">A new question waits. Answer it with your voice →</p>
            </button>
          )}

        {/* Voice card — swipeable */}
        <div
          className="card-ornate animate-fade-in"
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
          {/* Who */}
          <div className="text-center mb-5">
            <p className="text-kingdom-gold/40 text-[10px] tracking-[0.3em] uppercase font-display mb-1">A voice in the dark</p>
            <p className="font-display text-xl text-shimmer">{currentProfile.name}</p>
          </div>

          {/* One answer at a time */}
          {rec && (
            <div className="text-center mb-6" key={rec.id}>
              <p className="text-kingdom-gold/50 text-[10px] uppercase tracking-[0.2em] font-display mb-2">{q.label}</p>
              <p className="text-white/75 text-sm leading-relaxed mb-6 min-h-[3rem] animate-fade-in">{q.text}</p>
              <button
                onClick={() => playAudio(rec.storage_path)}
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all
                  ${playingPath === rec.storage_path ? 'bg-gradient-gold pulse-ring scale-105' : 'bg-gradient-gold glow-gold hover:scale-105'}`}
              >
                {audioLoading === rec.storage_path ? (
                  <div className="w-6 h-6 border-2 border-kingdom-darker border-t-transparent rounded-full animate-spin" />
                ) : playingPath === rec.storage_path ? (
                  <svg className="w-7 h-7 text-kingdom-darker" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                ) : (
                  <svg className="w-7 h-7 text-kingdom-darker ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              {recordings.length > 1 && (
                <div className="flex justify-center gap-2 mt-5">
                  {recordings.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; setPlayingPath(null) } setAnswerIdx(i) }}
                      aria-label={`Answer ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${i === answerIdx ? 'w-6 bg-kingdom-gold' : 'w-2 bg-white/20'}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/40 hover:bg-white/5 hover:border-white/20 transition-all text-sm font-medium"
            >
              Skip
            </button>
            <button
              onClick={handleLike}
              className="flex-1 btn-gold text-sm"
            >
              ♥ I like this voice
            </button>
          </div>
        </div>

        {/* Swipe indicator overlay */}
        {swiping && Math.abs(swipeOffset) > 50 && (
          <div className="fixed top-1/3 left-0 right-0 flex justify-center pointer-events-none z-40">
            <div className={`text-4xl font-display px-6 py-3 rounded-2xl backdrop-blur-sm ${
              swipeOffset > 50
                ? 'bg-kingdom-gold/20 text-kingdom-gold border border-kingdom-gold/40'
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {swipeOffset > 50 ? '♥ Like' : '✕ Skip'}
            </div>
          </div>
        )}
      </div>

      <EmberToast amount={toast?.amount} label={toast?.label} />

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
