import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { nudges } from '../data/prompts'
import AmbientBackground from '../components/AmbientBackground'
import EmberToast from '../components/EmberToast'
import { EMBERS, todayKey } from '../data/gamification'

// Days in a row (ending today or yesterday) on which BOTH people sent a voice note.
function flameStreak(messages, me) {
  const days = {}
  for (const m of messages) {
    const k = todayKey(new Date(m.created_at))
    days[k] = days[k] || { mine: false, theirs: false }
    if (m.sender_id === me) days[k].mine = true
    else days[k].theirs = true
  }
  const both = k => days[k]?.mine && days[k]?.theirs
  const d = new Date()
  if (!both(todayKey(d))) d.setDate(d.getDate() - 1)
  let streak = 0
  while (both(todayKey(d))) { streak++; d.setDate(d.getDate() - 1) }
  return { streak, litToday: both(todayKey()) }
}

export default function ChatRoom() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [otherUser, setOtherUser] = useState(null)
  const [userId, setUserId] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [playingId, setPlayingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const audioRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [nudge, setNudge] = useState(null)
  const [toast, setToast] = useState(null)
  const [nudgeDismissedAt, setNudgeDismissedAt] = useState(-1)

  useEffect(() => {
    loadChat()

    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'voice_messages',
        filter: `match_id=eq.${matchId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [matchId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Get match details
      const { data: match } = await supabase
        .from('matches')
        .select(`
          id,
          user1:profiles!matches_user1_id_fkey ( id, name, archetype ),
          user2:profiles!matches_user2_id_fkey ( id, name, archetype )
        `)
        .eq('id', matchId)
        .single()

      if (!match) return

      const other = match.user1?.id === user.id ? match.user2 : match.user1
      setOtherUser(other)

      // Load existing messages
      const { data: msgs } = await supabase
        .from('voice_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })

      setMessages(msgs || [])
    } catch (err) {
      console.error('Error loading chat:', err)
    } finally {
      setLoading(false)
    }
  }

  const startRecording = async () => {
    if (isRecording || mediaRecorder.current?.state === 'recording') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      chunks.current = []

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data)
      }

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await sendVoiceNote(blob)
      }

      mediaRecorder.current.start()
      setIsRecording(true)

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorder.current?.state === 'recording') {
          mediaRecorder.current.stop()
          setIsRecording(false)
        }
      }, 60000)
    } catch (err) {
      alert('Please allow microphone access to send voice notes.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const sendVoiceNote = async (blob) => {
    setUploading(true)
    try {
      const fileName = `${userId}/msg-${matchId}-${Date.now()}.webm`

      const { error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, blob, { contentType: 'audio/webm' })

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase
        .from('voice_messages')
        .insert({
          match_id: matchId,
          sender_id: userId,
          storage_path: fileName,
        })

      if (insertError) throw insertError
      setToast({ amount: EMBERS.voiceNote, label: 'Voice note sent' })
      setTimeout(() => setToast(null), 1500)
    } catch (err) {
      console.error('Error sending voice note:', err)
      alert('Failed to send. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const playMessage = async (msg) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
        if (playingId === msg.id) {
          setPlayingId(null)
          return
        }
      }

      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .createSignedUrl(msg.storage_path, 300)

      if (error) throw error

      const audio = new Audio(data.signedUrl)
      audioRef.current = audio

      audio.onended = () => {
        setPlayingId(null)
      }

      await audio.play()
      setPlayingId(msg.id)

      // Mark as read if from other user
      if (msg.sender_id !== userId && !msg.is_read) {
        await supabase
          .from('voice_messages')
          .update({ is_read: true })
          .eq('id', msg.id)
      }
    } catch (err) {
      console.error('Error playing message:', err)
    }
  }

  const getArchetypeEmoji = (archetype) => {
    const map = {
      protector: '🛡️', genius: '🧠', rebel: '⚡', romantic: '🌹',
      commander: '👑', adventurer: '🗺️', healer: '✨', wildcard: '🃏',
    }
    return map[archetype] || '🔮'
  }

  const randomNudge = () => nudges[Math.floor(Math.random() * nudges.length)]

  // The Oracle whispers when the chat is new, every 4th message, or has gone cold (1 hour+).
  useEffect(() => {
    if (loading || nudgeDismissedAt === messages.length) return
    const last = messages[messages.length - 1]
    const cold = last && Date.now() - new Date(last.created_at).getTime() > 60 * 60 * 1000
    const due = messages.length === 0 || messages.length % 4 === 0 || cold
    if (due) setNudge(n => n || randomNudge())
    else setNudge(null)
  }, [messages.length, loading, nudgeDismissedAt])

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-kingdom flex items-center justify-center">
        <div className="text-kingdom-gold animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col relative overflow-hidden">
      <AmbientBackground world="kingdom" />
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-white/5 relative z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/chats')}
            className="text-white/40 hover:text-white/60"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-2xl">{getArchetypeEmoji(otherUser?.archetype)}</span>
          <div>
            <p className="text-white font-medium">{otherUser?.name}</p>
            {(() => {
              const { streak, litToday } = flameStreak(messages, userId)
              return (
                <p className={`text-xs ${streak > 0 ? 'text-orange-300/80' : 'text-white/30'}`}>
                  {streak > 0
                    ? `🔥 ${streak}-day flame${litToday ? '' : ' · keep it alive today'}`
                    : 'Light a flame: both send a voice note today'}
                </p>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 relative z-10">
        <div className="max-w-md mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/30 text-sm">
                Say hello with your voice. Not sure what to say? The Oracle has an idea below.
              </p>
            </div>
          )}

          {messages.map(msg => {
            const isMine = msg.sender_id === userId
            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <button
                  onClick={() => playMessage(msg)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl max-w-[80%] transition-colors ${
                    isMine
                      ? 'bg-kingdom-gold/20 border border-kingdom-gold/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  {/* Play/pause icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isMine ? 'bg-kingdom-gold/30' : 'bg-white/10'
                  }`}>
                    {playingId === msg.id ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    )}
                  </div>

                  {/* Mini waveform */}
                  <div className="flex gap-0.5 items-end h-5">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-0.5 rounded-full ${
                          playingId === msg.id
                            ? 'bg-kingdom-gold waveform-bar'
                            : isMine ? 'bg-kingdom-gold/40' : 'bg-white/20'
                        }`}
                        style={{
                          height: playingId === msg.id ? undefined : `${3 + Math.random() * 14}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-white/30 text-[10px] flex-shrink-0">
                    {formatTime(msg.created_at)}
                  </span>
                </button>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <EmberToast amount={toast?.amount} label={toast?.label} />

      {/* Record button */}
      <div className="px-6 py-6 border-t border-white/5 relative z-10">
        {nudge && (
          <div className="max-w-md mx-auto mb-5 rounded-xl border border-kingdom-gold/25 bg-kingdom-gold/5 p-4 animate-fade-in">
            <p className="text-kingdom-gold/60 text-[10px] uppercase tracking-[0.25em] font-display mb-2">🔮 The Oracle whispers</p>
            <p className="text-white/80 text-sm leading-snug font-display">{nudge}</p>
            <div className="flex gap-4 mt-3 text-xs">
              <button onClick={() => setNudge(randomNudge())} className="text-kingdom-gold/70 hover:text-kingdom-gold">Another</button>
              <button onClick={() => { setNudge(null); setNudgeDismissedAt(messages.length) }} className="text-white/30 hover:text-white/50">Not now</button>
            </div>
          </div>
        )}
        <div className="max-w-md mx-auto flex justify-center">
          {uploading ? (
            <div className="text-kingdom-gold/60 text-sm animate-pulse">
              Sending voice note...
            </div>
          ) : (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 scale-110 animate-pulse'
                  : 'bg-kingdom-gold hover:scale-105'
              }`}
            >
              {isRecording ? (
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </div>
              ) : (
                <svg className="w-7 h-7 text-kingdom-darker" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              )}
            </button>
          )}
        </div>
        <p className="text-white/20 text-xs text-center mt-2">
          {isRecording ? 'Recording… tap again to send' : 'Tap the mic to record'}
        </p>
      </div>
    </div>
  )
}
