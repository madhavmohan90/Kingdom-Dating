// Embers, levels, badges and the nightly riddle.
// Everything here is computed from what people already do in the app
// (recordings, likes, matches, voice notes), so no extra database tables.

export const EMBERS = {
  trial: 20,     // each trial answered
  riddle: 30,    // each nightly riddle answered
  like: 5,       // each voice you like
  match: 50,     // each match
  voiceNote: 10, // each voice note sent in chat
}

export const levels = [
  { min: 0, name: 'Wanderer', emoji: '🕯️' },
  { min: 60, name: 'Squire', emoji: '🗡️' },
  { min: 150, name: 'Knight', emoji: '🛡️' },
  { min: 300, name: 'Enchanter', emoji: '🔮' },
  { min: 600, name: 'Dragon Rider', emoji: '🐉' },
  { min: 1000, name: 'Legend', emoji: '👑' },
]

export const badges = [
  { id: 'first-words', emoji: '🎙️', name: 'First Words', hint: 'Answer your first trial', earned: s => s.trials + s.riddles >= 1 },
  { id: 'survivor', emoji: '⚔️', name: 'Trial Survivor', hint: 'Answer all three trials', earned: s => s.trials >= 3 },
  { id: 'brave-heart', emoji: '💛', name: 'Brave Heart', hint: 'Like your first voice', earned: s => s.likes >= 1 },
  { id: 'masks-fallen', emoji: '🎭', name: 'Masks Fallen', hint: 'Get your first match', earned: s => s.matches >= 1 },
  { id: 'bard', emoji: '🪕', name: 'The Bard', hint: 'Send 10 voice notes', earned: s => s.voiceNotes >= 10 },
  { id: 'riddle-keeper', emoji: '🌙', name: 'Riddle Keeper', hint: 'Answer 3 nightly riddles', earned: s => s.riddles >= 3 },
]

export function levelFor(embers) {
  let current = levels[0]
  for (const l of levels) if (embers >= l.min) current = l
  const next = levels.find(l => l.min > embers) || null
  const progress = next ? (embers - current.min) / (next.min - current.min) : 1
  return { ...current, next, progress }
}

// ─── Tonight's Riddle: one new question every day, same for everyone ───
export const riddles = [
  'A dragon offers to be your pet, but it only eats one thing you love. What do you feed it?',
  'You wake up in a castle with no memory. One person greets you by name. What do you hope they say?',
  'A fortune teller says your soulmate is in this room. What is the first thing you say out loud?',
  'You can swap lives with any fairy-tale character for one day. Who, and what do you do first?',
  'A ghost has haunted your house for 100 years. It finally speaks. What does it ask you?',
  'You find a love letter in an old book, never sent. Read us the first line.',
  'A wizard turns your voice into a spell. What does your voice do to people?',
  'You are crowned for one night. What is your first royal rule?',
  'A talking cat says it knows your darkest secret. What do you offer it to stay quiet?',
  'Your sword has a name and a personality. Introduce it.',
  'The moon goes missing and only you can bring it back. How?',
  'A witch says she will grant one wish, but your date chooses it. What do you hope they pick?',
  'You are the villain in someone else\'s story. What did you do to them?',
  'You have one bottle of love potion. Who should never drink it, and why?',
]

const pad = n => String(n).padStart(2, '0')

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function riddleFor(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number)
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86400000)
  return riddles[day % riddles.length]
}

export const riddleId = (dateKey = todayKey()) => `riddle-${dateKey}`
export const isRiddleId = id => typeof id === 'string' && id.startsWith('riddle-')
