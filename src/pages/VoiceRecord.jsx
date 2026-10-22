import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { pickTrials, trialKinds, questPool } from '../data/prompts'
import AmbientBackground from '../components/AmbientBackground'
import EmberToast from '../components/EmberToast'
import { narrate, stopNarration } from '../lib/narrator'
import { EMBERS, riddleFor, riddleId, todayKey } from '../data/gamification'

const MAX_SECONDS = 60

export default function VoiceRecord() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isRiddle = searchParams.get('daily') === '1'
  const [trials, setTrials] = useState(() => isRiddle
    ? [{ id: riddleId(), kind: 'riddle', text: riddleFor(todayKey()), narrator: 'The moon rises. A new riddle waits for your voice.' }]
    : pickTrials())
  const [toast, setToast] = useState(null)
  const [step, setStep] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const mediaRecorder = useRef(null)
  const chunks = useRef([])
  const timer = useRef(null)

  const trial = trials[step]
  const kind = trialKinds[trial.kind]

  useEffect(() => () => { clearInterval(timer.current); stopNarration() }, [])

  // The narrator reads each question aloud (silent until the ElevenLabs clips are added)
  useEffect(() => {
    if (isRiddle) narrate('riddle')
    else narrate(step === 0 ? ['trials-intro', trial.id] : trial.id)
  }, [trial.id])

  const startRecording = async () => {
    try {
      stopNarration()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      chunks.current = []
      mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRecorder.current.start()
      setIsRecording(true)
      setSeconds(0)
      timer.current = setInterval(() => {
        setSeconds(s => {
          if (s + 1 >= MAX_SECONDS) stopRecording()
          return s + 1
        })
      }, 1000)
    } catch {
      alert('Please allow microphone access to record your voice.')
    }
  }

  const stopRecording = () => {
    clearInterval(timer.current)
    if (mediaRecorder.current?.state === 'recording') mediaRecorder.current.stop()
    setIsRecording(false)
  }

  const reRecord = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setSeconds(0)
  }

  const goNext = (count) => {
    if (step < trials.length - 1) {
      setStep(step + 1)
      reRecord()
    } else {
      navigate(count > 0 ? '/worlds' : '/me')
    }
  }

  // Swap the current question for another of the same kind.
  const reroll = () => {
    const others = questPool.filter(q => q.kind === trial.kind && q.id !== trial.id)
    const next = others[Math.floor(Math.random() * others.length)]
    setTrials(ts => ts.map((t, i) => (i === step ? next : t)))
  }

  const saveAndContinue = async () => {
    if (!audioBlob) return
    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) {
        alert('Your session ended. Please enter the realm again.')
        navigate('/gate')
        return
      }

      const fileName = `${user.id}/${trial.id}-${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' })
      if (uploadError) throw new Error(uploadError.message)

      const { error: dbError } = await supabase.from('voice_recordings').insert({
        user_id: user.id,
        prompt_id: trial.id,
        storage_path: fileName,
        is_primary: savedCount === 0,
        duration_seconds: seconds || null,
      })
      if (dbError) throw new Error(dbError.message)

      const count = savedCount + 1
      setSavedCount(count)
      setToast(isRiddle
        ? { amount: EMBERS.riddle, label: 'Riddle answered' }
        : { amount: EMBERS.trial, label: step < trials.length - 1 ? `Trial ${step + 1} survived` : 'All three trials survived!' })
      setTimeout(() => { setToast(null); goNext(count) }, 1500)
    } catch (err) {
      alert('Could not save your voice: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col px-6 py-12 relative overflow-hidden">
      <AmbientBackground world="kingdom" />

      <div className="max-w-md mx-auto w-full flex-1 flex flex-col relative z-10">
        <EmberToast amount={toast?.amount} label={toast?.label} />

        {/* Progress: three trial dots */}
        <div className={`flex items-center justify-center gap-3 mb-8 ${isRiddle ? 'hidden' : ''}`}>
          {trials.map((t, i) => (
            <div key={t.id} className={`flex items-center justify-center w-10 h-10 rounded-full border text-lg transition-all
              ${i === step ? 'border-kingdom-gold bg-kingdom-gold/15 scale-110'
                : i < step ? 'border-kingdom-gold/40 bg-kingdom-gold/5 opacity-60'
                : 'border-white/10 opacity-30'}`}>
              {trialKinds[t.kind].emoji}
            </div>
          ))}
        </div>

        <div className="text-center mb-6 animate-fade-in" key={trial.id}>
          <p className="text-kingdom-gold/50 text-xs tracking-[0.3em] uppercase font-display mb-2">
            {isRiddle ? `🌙 ${kind.label} · +${EMBERS.riddle} embers` : `Trial ${step + 1} of 3 · ${kind.label} · +${EMBERS.trial} embers`}
          </p>
          <p className="text-white/35 text-sm italic">{trial.narrator}</p>
        </div>

        {/* The question */}
        <div className="rounded-2xl p-6 mb-6 relative overflow-hidden animate-fade-in" key={trial.id + '-q'}
             style={{
               background: 'linear-gradient(145deg, rgba(212,168,67,0.08) 0%, rgba(212,168,67,0.02) 100%)',
               border: '1px solid rgba(212,168,67,0.25)',
               boxShadow: '0 0 40px rgba(212,168,67,0.06)',
             }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-kingdom-gold/40 to-transparent" />
          <p className="text-white/90 text-lg leading-relaxed font-display text-center">{trial.text}</p>
        </div>

        {step === 0 && !isRiddle && !audioUrl && (
          <p className="text-kingdom-gold/60 text-xs text-center font-display mb-4">
            🎙️ Start with your name: <span className="text-white/70 italic">"I am …"</span> Then answer. Be yourself — laugh, think, go wild.
          </p>
        )}

        {/* Recorder */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {!audioUrl ? (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                  ${isRecording ? 'bg-red-500 scale-110 pulse-ring' : 'bg-gradient-gold hover:scale-105 glow-gold'}`}
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
              <p className="text-white/40 text-sm mt-4 font-display">
                {isRecording ? `Speaking… ${seconds}s / ${MAX_SECONDS}s · tap to stop` : 'Tap and speak your answer'}
              </p>
              {isRecording && (
                <div className="flex gap-1 mt-4 items-end h-6">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-1 bg-kingdom-gold rounded-full waveform-bar"
                         style={{ animationDelay: `${i * 0.1}s`, height: '4px' }} />
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
                <button onClick={reRecord} className="btn-outline flex-1">Try again</button>
                <button onClick={saveAndContinue} disabled={uploading} className="btn-gold flex-1 disabled:opacity-50">
                  {uploading ? 'Sealing…' : step < trials.length - 1 ? 'Save & next trial →' : 'Submit my voice ✦'}
                </button>
              </div>
            </>
          )}
        </div>

        {!isRecording && !audioUrl && !isRiddle && (
          <button
            onClick={reroll}
            className="text-white/25 text-sm text-center mt-6 hover:text-white/50 transition-colors"
          >
            Give me a different question
          </button>
        )}
      </div>
    </div>
  )
}
