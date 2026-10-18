import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Chats() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('matches')
        .select(`
          id, created_at,
          user1:profiles!matches_user1_id_fkey ( id, name, archetype ),
          user2:profiles!matches_user2_id_fkey ( id, name, archetype )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      setMatches(data || [])
    } catch (err) {
      console.error('Error loading matches:', err)
    } finally {
      setLoading(false)
    }
  }

  const getArchetypeEmoji = (archetype) => {
    const map = {
      protector: '🛡️', genius: '🧠', rebel: '⚡', romantic: '🌹',
      commander: '👑', adventurer: '🗺️', healer: '✨', wildcard: '🃏',
    }
    return map[archetype] || '❓'
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
          Voice Chats
        </h1>
        <p className="text-white/40 text-sm mb-8">
          Voice notes only. No text. Pure connection.
        </p>

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🎙️</div>
            <p className="text-white/40 text-sm mb-2">
              No matches yet
            </p>
            <p className="text-white/30 text-xs">
              When someone you like, likes you back — your quest begins here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map(match => {
              const otherUser = match.user1?.id === userId
                ? match.user2
                : match.user1
              return (
                <button
                  key={match.id}
                  onClick={() => navigate(`/chat/${match.id}`)}
                  className="w-full card-dark flex items-center gap-4 hover:border-kingdom-gold/20 transition-colors"
                >
                  <span className="text-2xl">
                    {getArchetypeEmoji(otherUser?.archetype)}
                  </span>
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium text-sm">
                      {otherUser?.name}
                    </p>
                    <p className="text-white/30 text-xs">
                      Tap to send a voice note
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
