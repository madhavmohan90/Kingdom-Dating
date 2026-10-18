import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

// Pages
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Gate from './pages/Gate'
import Quiz from './pages/Quiz'
import ArchetypeReveal from './pages/ArchetypeReveal'
import WorldSelect from './pages/WorldSelect'
import VoiceRecord from './pages/VoiceRecord'
import Discover from './pages/Discover'
import Likes from './pages/Likes'
import Chats from './pages/Chats'
import Profile from './pages/Profile'
import ChatRoom from './pages/ChatRoom'
import EditProfile from './pages/EditProfile'

// Components
import BottomNav from './components/BottomNav'

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
        <Route path="/" element={session ? <Navigate to="/worlds" /> : <Landing />} />
        <Route path="/gate" element={<Gate />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Onboarding routes */}
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/archetype" element={<ArchetypeReveal />} />
        <Route path="/world-select" element={<WorldSelect />} />
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
