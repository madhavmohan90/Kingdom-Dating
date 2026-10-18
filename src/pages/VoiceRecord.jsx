import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { worldPrompts, worldMeta } from '../data/prompts'
import AmbientBackground from '../components/AmbientBackground'

export default function VoiceRecord() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [world, setWorld] = useState('kingdom')
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [recorded, setRecorded] = useState(false)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])

  useEffect(() => {
    const loadWorld = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('selected_world')
          .eq('id', session.user.id)
          .single()
        if (data?.selected_world) setWorld(data.selected_world)
      }
    }
    loadWorld()
  }, [])

  const prompts = worldPrompts[world] || worldPrompts.kingdom
  const meta = worldMeta[world] || worldMeta.kingdom
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
      const { data: { session } } = await supabase.auth.getSession()
      let user = session?.user
      if (!user) {
        const { data: { user: serverUser }, error: authError } = await supabase.auth.getUser()
        user = serverUser
        if (authError || !user) {
          alert('You need to log in first to save your recording.')
          navigate('/signup')
          return
        }
      }
      if (!audioBlob) {
        alert('No recording found. Please record your voice first.')
        return
      }

      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()

      let bucketName = 'voice-recordings'
      if (buckets && buckets.length > 0) {
        const exactMatch = buckets.find(b => b.name === 'voice-recordings')
        if (!exactMatch) {
          const voiceBucket = buckets.find(b => b.name.toLowerCase().includes('voice'))
          if (voiceBucket) {
            bucketName = voiceBucket.name
          } else {
            alert('Storage bucket "voice-recordings" not found. Please create one in Supabase Storage.')
            return
          }
        }
      }

      const fileName = `${user.id}/${prompt.id}-${Date.now()}.webm`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, audioBlob, { contentType: 'audio/webm' })

      if (uploadError) {
        throw new Error('Storage upload: ' + (uploadError.message || JSON.stringify(uploadError)))
      }

      const { error: dbError } = await supabase.from('voice_recordings').insert({
        user_id: user.id,
        prompt_id: prompt.id,
        storage_path: fileName,
        is_primary: currentPrompt === 0,
      })

      if (dbError) {
        throw new Error('Database save: ' + dbError.message)
      }

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
    <div className={`min-h-screen ${meta.bgClass} flex flex-col px-6 py-12 relative overflow-hidden`}>
      <AmbientBackground world={world} />

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-kingdom-gold/50 text-sm tracking-[0.15em] uppercase mb-2 font-display">
            {meta.emoji} {meta.name} — Quest {currentPrompt + 1} of {prompts.length}
          </p>
          <h1 className="font-display text-2xl font-bold text-shimmer mb-1">
            Your Voice, Your Power
          </h1>
          <p className="text-white/35 text-sm">
            Record your response to this quest prompt. This is how others will discover you.
          </p>
        </div>

        {/* Narrator text */}
        <div className="card-ornate mb-6">
          <p className="text-kingdom-gold/40 text-xs uppercase tracking-[0.2em] mb-3 font-display">
            The Narrator speaks...
          </p>
          <p className="text-white/50 text-sm italic leading-relaxed">
            "{prompt.narrator}"
          </p>
        </div>

        {/* Quest prompt */}
        <div className="rounded-2xl p-6 mb-8 relative overflow-hidden"
             style={{
               background: 'linear-gradient(145deg, rgba(212,168,67,0.06) 0%, rgba(212,168,67,0.02) 100%)',
               border: '1px solid rgba(212,168,67,0.2)',
               boxShadow: '0 0 40px rgba(212,168,67,0.05)',
             }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kingdom-gold/30 to-transparent" />
          <p className="text-kingdom-gold/90 text-base leading-relaxed font-display">
            "{prompt.text}"
          </p>
        </div>

        {/* Recording interface */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {!recorded ? (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                  ${isRecording
                    ? 'bg-red-500 scale-110 pulse-ring'
                    : 'bg-gradient-gold hover:scale-105 glow-gold'
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

              <p className="text-white/35 text-sm mt-4">
                {isRecording ? '✦ Recording... Tap to stop' : 'Tap to start recording'}
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
              <div className="w-full card-ornate mb-6">
                <audio src={audioUrl} controls className="w-full" />
              </div>

              <div className="flex gap-3 w-full">
                <button onClick={reRecord} className="btn-outline flex-1">
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
          className="text-white/20 text-sm text-center mt-6 hover:text-white/40 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
