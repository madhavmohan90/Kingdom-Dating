import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function EditProfile() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
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
        .select('name, age, bio')
        .eq('id', user.id)
        .single()

      if (data) {
        setName(data.name || '')
        setAge(data.age?.toString() || '')
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
        .update({
          name,
          age: parseInt(age),
          bio,
        })
        .eq('id', user.id)

      if (error) throw error
      navigate('/me')
    } catch (err) {
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-kingdom flex items-center justify-center">
        <div className="text-kingdom-gold animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom px-6 pt-12 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/me')}
            className="text-white/40 hover:text-white/60 text-sm"
          >
            ← Back
          </button>
          <h1 className="font-display text-2xl text-kingdom-gold">
            Edit Profile
          </h1>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-white/60 text-sm mb-1 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-kingdom-gold/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              min="18"
              max="65"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-kingdom-gold/50 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Bio (optional)</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="A few words about yourself..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-kingdom-gold/50 focus:outline-none transition-colors resize-none"
            />
            <p className="text-white/20 text-xs mt-1 text-right">{bio.length}/200</p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !name || !age}
            className="btn-gold w-full mt-6 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
