import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kumywrcdknoswdiibvoz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bXl3cmNka25vc3dkaWlidm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjM0OTUsImV4cCI6MjA3MzkzOTQ5NX0.wT-ontLfa6XDwm5yWcYg3wKh-PwsGIs0csbYBgA8Z38'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
