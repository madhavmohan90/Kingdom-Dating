import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const prompts = [
  {
    id: 'kingdom-1',
    world: 'kingdom',
    text: "You've been crowned ruler for a day. In 30 seconds, give the speech that makes your kingdom fall in love with you.",
    narrator: "The throne room falls silent. A thousand eyes are on you. Speak.",
  },
  {
    id: 'kingdom-2',
    world: 'kingdom',
    text: "A dragon has taken someone you love. You have one message to send them before you ride out. What do you say?",
    narrator: "The messenger waits. Your words may be the last they hear.",
  },
  {
    id: 'kingdom-3',
    world: 'kingdom',
    text: "You find a wounded stranger on the road. They ask you to tell them a story to keep them awake. Begin.",
    narrator: "The night is dark. Your voice is all that stands between them and silence.",
  },
]

export default function VoiceRecord() {
  const navigate = useNavigate()
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])

  const prompt = prompts[currentPrompt]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      chunks.current = []

      mediaRecorder.current.ondataavailable = (e) => {
        chunks.current.push(e.data)
      }

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        setRecorded(true)
        stream.getTracks().forEach(track => track.stop())
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
      alert('Please allow microphone access to record your voice.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current?.state === 'recording') {
      mediaRecorder.current.stop()
      setIsRecording(false)
    }
  }

  const reRecord = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecorded(false)
  }

  const uploadAndContinue = async () => {
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !audioBlob) return

      const fileName = `${user.id}/${prompt.id}-${Date.now()}.webm`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' })

      if (uploadError) throw uploadError

      // Save recording reference
      await supabase.from('voice_recordings').insert({
        user_id: user.id,
        prompt_id: prompt.id,
        storage_path: fileName,
        is_primary: currentPrompt === 0,
      })

      // If first prompt done, go to main app. Otherwise next prompt.
      if (currentPrompt === 0) {
        navigate('/worlds')
      } else {
        setCurrentPrompt(prev => prev + 1)
        reRecord()
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Upload failed: ' + (err.message || JSON.stringify(err)))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col px-6 py-12">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <p className="text-kingdom-gold/60 text-sm tracking-[0.2em] uppercase mb-2">
            Quest Voice Recording
          </p>
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Your Voice, Your Power
          </h1>
          <p className="text-white/40 text-sm">
            Record your response to this quest prompt. This is how others will discover you.
          </p>
        </div>

        {/* Narrator text */}
        <div className="card-dark mb-6">
          <p className="text-white/30 text-xs uppercase tracking-wider mb-3">
            🎭 The Narrator speaks...
          </p>
          <p className="text-white/50 text-sm italic leading-relaxed">
            "{prompt.narrator}"
          </p>
        </div>

        {/* Quest prompt */}
        <div className="bg-kingdom-gold/5 border border-kingdom-gold/20 rounded-2xl p-6 mb-8">
          <p className="text-kingdom-gold text-base leading-relaxed">
            "{prompt.text}"
          </p>
        </div>

        {/* Recording interface */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {!recorded ? (
            <>
              {/* Record button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                  ${isRecording
                    ? 'bg-red-500 scale-110 animate-pulse'
                    : 'bg-kingdom-gold hover:scale-105'
                  }`}
              >
                {isRecording ? (
                  <div className="w-8 h-8 bg-white rounded-sm" />
                ) : (
                  <svg className="w-10 h-10 text-kingdom-darker" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </button>

              <p className="text-white/40 text-sm mt-4">
                {isRecording ? 'Recording... Tap to stop' : 'Tap to start recording'}
              </p>

              {isRecording && (
                <div className="flex gap-1 mt-4 items-end h-6">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-kingdom-gold rounded-full waveform-bar"
                      style={{ animationDelay: `${i * 0.1}s`, height: '4px' }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Playback */}
              <div className="w-full card-dark mb-6">
                <audio src={audioUrl} controls className="w-full" />
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={reRecord}
                  className="btn-outline flex-1"
                >
                  Re-record
                </button>
                <button
                  onClick={uploadAndContinue}
                  disabled={uploading}
                  className="btn-gold flex-1 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Continue →'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Skip option */}
        <button
          onClick={() => navigate('/worlds')}
          className="text-white/30 text-sm text-center mt-6 hover:text-white/50"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
