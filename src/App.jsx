import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

// Pages
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Gate from './pages/Gate'
import VoiceRecord from './pages/VoiceRecord'
import Discover from './pages/Discover'
import Likes from './pages/Likes'
import Chats from './pages/Chats'
import Profile from './pages/Profile'
import ChatRoom from './pages/ChatRoom'
import EditProfile from './pages/EditProfile'

// Components
import BottomNav from './components/BottomNav'

// Sends a returning visitor to the right place:
// no voice yet -> the three trials, otherwise -> the voices.
function Entry() {
  const [dest, setDest] = useState(null)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setDest('/')
      const { count } = await supabase
        .from('voice_recordings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setDest(count > 0 ? '/worlds' : '/voice-record')
    })()
  }, [])
  if (!dest) {
    return (
      <div className="min-h-screen bg-kingdom-darker flex items-center justify-center">
        <div className="text-kingdom-gold font-display text-xl animate-pulse">Opening the gate…</div>
      </div>
    )
  }
  return <Navigate to={dest} replace />
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-kingdom-darker flex items-center justify-center">
        <div className="text-kingdom-gold font-display text-2xl animate-pulse">
          Kingdom Dating
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-kingdom-darker">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={session ? <Entry /> : <Landing />} />
        <Route path="/gate" element={<Gate />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Onboarding routes */}
        <Route path="/quiz" element={<Navigate to="/voice-record" replace />} />
        <Route path="/archetype" element={<Navigate to="/voice-record" replace />} />
        <Route path="/world-select" element={<Navigate to="/worlds" replace />} />
        <Route path="/voice-record" element={<VoiceRecord />} />

        {/* Chat room and edit profile (no bottom nav) */}
        <Route path="/chat/:matchId" element={<ChatRoom />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        {/* Main app routes (with bottom nav) */}
        <Route path="/worlds" element={<><Discover /><BottomNav active="worlds" /></>} />
        <Route path="/likes" element={<><Likes /><BottomNav active="likes" /></>} />
        <Route path="/chats" element={<><Chats /><BottomNav active="chats" /></>} />
        <Route path="/me" element={<><Profile /><BottomNav active="me" /></>} />
      </Routes>
    </div>
  )
}

export default App
