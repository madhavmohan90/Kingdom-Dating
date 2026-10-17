import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Likes() {
  const [likes, setLikes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLikes()
  }, [])

  const loadLikes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('likes')
        .select(`
          id, created_at,
          liker:profiles!likes_liker_id_fkey ( id, name, age, archetype )
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
            {likes.map(like => (
              <div key={like.id} className="card-dark flex items-center gap-4">
                <span className="text-2xl">
                  {getArchetypeEmoji(like.liker?.archetype)}
                </span>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    {like.liker?.name}, {like.liker?.age}
                  </p>
                  <p className="text-white/40 text-xs">
                    Liked your voice
                  </p>
                </div>
                <button className="bg-kingdom-gold/10 text-kingdom-gold text-xs px-3 py-1.5 rounded-lg hover:bg-kingdom-gold/20 transition-colors">
                  Listen
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
