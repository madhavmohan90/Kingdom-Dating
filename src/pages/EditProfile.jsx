import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AmbientBackground from '../components/AmbientBackground'

export default function EditProfile() {
  const navigate = useNavigate()
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/'); return }

      const { data } = await supabase
        .from('profiles')
        .select('bio')
        .eq('id', user.id)
        .single()

      if (data) {
        setBio(data.bio || '')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', user.id)

      if (error) throw error
      navigate('/me')
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full bg-white/5 border border-kingdom-gold/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:border-kingdom-gold/40 focus:outline-none focus:bg-white/8 transition-all"

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-kingdom flex items-center justify-center relative overflow-hidden">
        <AmbientBackground world="kingdom" />
        <div className="text-kingdom-gold animate-pulse relative z-10">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom px-6 pt-12 pb-24 relative overflow-hidden">
      <AmbientBackground world="kingdom" />

      <div className="max-w-md mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/me')}
            className="text-white/30 hover:text-kingdom-gold/60 text-sm transition-colors"
          >
            ← Back
          </button>
          <h1 className="font-display text-2xl text-shimmer">Your Legend</h1>
        </div>

        <div className="card-ornate">
          <div className="space-y-5">
            <div>
              <label className="text-kingdom-gold/40 text-xs uppercase tracking-wider mb-1.5 block font-display">A few words of legend</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="A line the realm will whisper about you..."
                className={`${inputClass} resize-none`}
              />
              <p className="text-white/15 text-xs mt-1 text-right">{bio.length}/200</p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-gold w-full mt-2 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
