import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import MatchCelebration from '../components/MatchCelebration'
import { narrate } from '../lib/narrator'

export default function Likes() {
  const [likes, setLikes] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState(null)
  const [userId, setUserId] = useState(null)
  const [matchData, setMatchData] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    loadLikes()
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  const loadLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('likes')
        .select(`
          id, created_at,
          liker:profiles!likes_liker_id_fkey (
            id, name, archetype,
            voice_recordings ( id, storage_path, is_primary, created_at )
          )
        `)
        .eq('liked_id', user.id)
        .order('created_at', { ascending: false })

      setLikes(data || [])
    } catch (err) {
      console.error('Error loading likes:', err)
    } finally {
      setLoading(false)
    }
  }

  const playVoice = async (like) => {
    try {
      const recording = [...(like.liker?.voice_recordings || [])]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

      if (!recording) return

      // Toggle off if already playing
      if (audioRef.current && playingId === like.id) {
        audioRef.current.pause()
        audioRef.current = null
        setPlayingId(null)
        return
      }

      // Stop previous
      if (audioRef.current) {
        audioRef.current.pause()
      }

      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .createSignedUrl(recording.storage_path, 300)

      if (error) throw error

      const audio = new Audio(data.signedUrl)
      audioRef.current = audio
      audio.onended = () => setPlayingId(null)
      await audio.play()
      setPlayingId(like.id)
    } catch (err) {
      console.error('Error playing voice:', err)
    }
  }

  const handleLikeBack = async (likedUserId, likerProfile) => {
    if (!userId) return
    try {
      const { error: likeError } = await supabase.from('likes').insert({
        liker_id: userId,
        liked_id: likedUserId,
      })
      // 23505 = already liked: fine, still check for a match below
      if (likeError && likeError.code !== '23505') {
        alert('Could not like back: ' + likeError.message)
        return
      }

      const { data: match } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${userId},user2_id.eq.${likedUserId}),and(user1_id.eq.${likedUserId},user2_id.eq.${userId})`)
        .maybeSingle()

      if (match) {
        narrate('match')
        setMatchData({
          matchId: match.id,
          otherUser: likerProfile,
        })
      } else {
        alert('Liked back, but no match was created. The match setup in the database needs fixing.')
      }
    } catch (err) {
      alert('Something went wrong: ' + err.message)
    }
  }

  const getArchetypeEmoji = (archetype) => {
    const map = {
      protector: '🛡️', genius: '🧠', rebel: '⚡', romantic: '🌹',
      commander: '👑', adventurer: '🗺️', healer: '✨', wildcard: '🃏',
    }
    return map[archetype] || '🔮'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-kingdom flex items-center justify-center pb-20">
        <div className="text-kingdom-gold animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom px-6 pt-12 pb-24">
      <div className="max-w-md mx-auto">
        <h1 className="font-display text-2xl text-kingdom-gold mb-2">
          Voices Who Liked You
        </h1>
        <p className="text-white/40 text-sm mb-8">
          Listen back and decide who moves you.
        </p>

        {likes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">💛</div>
            <p className="text-white/40 text-sm">
              No likes yet. Your voice is out there — give it time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {likes.map(like => {
              const hasRecording = like.liker?.voice_recordings?.length > 0
              return (
                <div key={like.id} className="card-dark">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-2xl">
                      {getArchetypeEmoji(like.liker?.archetype)}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {like.liker?.name}
                      </p>
                      <p className="text-white/40 text-xs">
                        Liked your voice
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {hasRecording && (
                      <button
                        onClick={() => playVoice(like)}
                        className={`flex-1 text-xs px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                          playingId === like.id
                            ? 'bg-kingdom-gold/20 text-kingdom-gold border border-kingdom-gold/30'
                            : 'bg-white/5 text-white/50 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {playingId === like.id ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                            </svg>
                            Playing...
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Listen
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleLikeBack(like.liker?.id, like.liker)}
                      className="flex-1 btn-gold text-xs py-2"
                    >
                      Like Back
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Match celebration overlay */}
      {matchData && (
        <MatchCelebration
          matchData={matchData}
          onClose={() => setMatchData(null)}
        />
      )}
    </div>
  )
}
