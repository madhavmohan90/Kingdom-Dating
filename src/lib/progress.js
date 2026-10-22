import { supabase } from './supabase'
import { EMBERS, badges, levelFor, isRiddleId, riddleId } from '../data/gamification'

// Reads what the person has done and turns it into embers, a level and badges.
export async function loadProgress(userId) {
  const count = async (table, col) => {
    const { count } = await supabase.from(table).select('id', { count: 'exact', head: true }).eq(col, userId)
    return count || 0
  }

  const [{ data: recs }, likes, voiceNotes, m1, m2] = await Promise.all([
    supabase.from('voice_recordings').select('prompt_id').eq('user_id', userId),
    count('likes', 'liker_id'),
    count('voice_messages', 'sender_id'),
    count('matches', 'user1_id'),
    count('matches', 'user2_id'),
  ])

  const ids = (recs || []).map(r => r.prompt_id)
  const riddleIds = new Set(ids.filter(isRiddleId))
  const trialIds = new Set(ids.filter(id => !isRiddleId(id)))

  const stats = {
    trials: Math.min(trialIds.size, 3),
    riddles: riddleIds.size,
    likes,
    matches: m1 + m2,
    voiceNotes,
  }

  const embers =
    stats.trials * EMBERS.trial +
    stats.riddles * EMBERS.riddle +
    stats.likes * EMBERS.like +
    stats.matches * EMBERS.match +
    stats.voiceNotes * EMBERS.voiceNote

  return {
    stats,
    embers,
    level: levelFor(embers),
    badges: badges.map(b => ({ ...b, has: b.earned(stats) })),
    riddleDoneToday: riddleIds.has(riddleId()),
  }
}

// Remembers the last level shown on this device, so a level-up can be celebrated once.
export function checkLevelUp(levelName) {
  try {
    const prev = localStorage.getItem('kd-level')
    localStorage.setItem('kd-level', levelName)
    return prev !== null && prev !== levelName
  } catch {
    return false
  }
}
