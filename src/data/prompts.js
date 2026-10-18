// ─── The Three Trials ────────────────────────────────────────────────
// Everyone (men and women) answers three trials out loud: one dramatic,
// one sacrifice, one funny. Others listen to HOW you answer.

export const trialKinds = {
  drama: { label: 'Trial of Courage', emoji: '🐉' },
  sacrifice: { label: 'Trial of the Heart', emoji: '🩸' },
  funny: { label: 'Trial of Mischief', emoji: '🧹' },
  legacy: { label: 'Old Quest', emoji: '📜' },
}

export const questPool = [
  // Drama — danger, action, protect
  { id: 'q-dragon', kind: 'drama', text: 'A dragon lands in front of your partner in the jungle. You have 30 seconds. No weapons. What do you do?', narrator: 'The ground shakes. Fire glows in its throat.' },
  { id: 'q-ship', kind: 'drama', text: "You're both on a sinking ghost ship. One rope, one way out. Who climbs first, and what do you shout?", narrator: 'Cold water rushes in. The ghosts are laughing.' },
  { id: 'q-army', kind: 'drama', text: 'A dark army is at the gates. You can save your village or the one you love. Make the call.', narrator: 'Drums in the distance. Torches everywhere.' },
  { id: 'q-masked', kind: 'drama', text: "At a masked ball, a stranger whispers: 'Someone here wants to kill you.' What's your next move?", narrator: 'Music plays. Every face is hidden.' },

  // Sacrifice — love, loss, deep choices
  { id: 'q-vampire', kind: 'sacrifice', text: 'A vampire needs blood to rise. Yours or your loved one\'s. One of you walks free. What do you tell the vampire?', narrator: 'Its eyes glow red. It is waiting for your answer.' },
  { id: 'q-witch', kind: 'sacrifice', text: 'A witch can bring back someone you lost. The price: you forget the person you love today. Do you take the deal?', narrator: 'The cauldron bubbles. She smiles.' },
  { id: 'q-forever', kind: 'sacrifice', text: 'Live forever, but alone. Or live one year with your soulmate. Which one, and why?', narrator: 'Two candles burn. You may keep only one.' },
  { id: 'q-memory', kind: 'sacrifice', text: "A curse will erase your partner's memory of you at sunrise. You have one night. What do you do?", narrator: 'The moon is high. Sunrise is coming.' },

  // Funny — light, playful
  { id: 'q-frog', kind: 'funny', text: 'You kiss a frog and it turns into your ex. What is the first thing you say?', narrator: 'Poof. Smoke. Oh no.' },
  { id: 'q-cat', kind: 'funny', text: 'You accidentally turned your date into a cat for a week. Explain it to them.', narrator: 'Meow. They do not look happy.' },
  { id: 'q-potion', kind: 'funny', text: 'A truth potion hits you on your first date. What is the most dangerous thing that comes out of your mouth?', narrator: 'Your lips start moving on their own…' },
  { id: 'q-genie', kind: 'funny', text: 'A genie gives you three wishes, but your date hears every one. What is wish number one?', narrator: 'The lamp glows. Your date is listening.' },
  { id: 'q-broom', kind: 'funny', text: "Your flying broom breaks down mid-air on a date. What's your excuse?", narrator: 'Sputter. Sputter. Falling.' },
]

export const questById = Object.fromEntries(questPool.map(q => [q.id, q]))

// One random trial from each kind: drama, sacrifice, funny.
export function pickTrials() {
  return ['drama', 'sacrifice', 'funny'].map(kind => {
    const pool = questPool.filter(q => q.kind === kind)
    return pool[Math.floor(Math.random() * pool.length)]
  })
}

// Older world prompts (kept so old recordings still show their question)

export const worldPrompts = {
  kingdom: [
    {
      id: 'kingdom-1',
      text: "You've been crowned ruler for a day. In 30 seconds, give the speech that makes your kingdom fall in love with you.",
      narrator: "The throne room falls silent. A thousand eyes are on you. Speak.",
    },
    {
      id: 'kingdom-2',
      text: "A dragon has taken someone you love. You have one message to send them before you ride out. What do you say?",
      narrator: "The messenger waits. Your words may be the last they hear.",
    },
    {
      id: 'kingdom-3',
      text: "You find a wounded stranger on the road. They ask you to tell them a story to keep them awake. Begin.",
      narrator: "The night is dark. Your voice is all that stands between them and silence.",
    },
    {
      id: 'kingdom-4',
      text: "Your rival has challenged you to a duel at dawn. The night before, you write a letter to the person you can't stop thinking about. Read it aloud.",
      narrator: "Candlelight flickers. The ink is still wet. Tomorrow is uncertain.",
    },
    {
      id: 'kingdom-5',
      text: "You've discovered a secret passageway in the castle. Where does it lead, and what do you find? Tell the story.",
      narrator: "The stone wall slides open. Cold air rushes past. You step into the dark.",
    },
    {
      id: 'kingdom-6',
      text: "A bard asks you to describe the most beautiful thing you've ever seen — but you can't say a person's name. Go.",
      narrator: "The tavern grows quiet. The bard's fingers rest on the strings, waiting.",
    },
  ],

  cosmos: [
    {
      id: 'cosmos-1',
      text: "You're the last human on a generation ship. Record a message for whoever finds this vessel in a thousand years.",
      narrator: "The stars drift past the viewport. The ship hums. You press record.",
    },
    {
      id: 'cosmos-2',
      text: "An alien civilization asks you to explain love using only sounds and your voice. No definitions allowed.",
      narrator: "The translation matrix fails. They can only understand tone, rhythm, emotion.",
    },
    {
      id: 'cosmos-3',
      text: "You've discovered a new planet. Name it and describe what you see as you take your first steps on its surface.",
      narrator: "The airlock hisses open. Gravity feels different here. Everything does.",
    },
    {
      id: 'cosmos-4',
      text: "Mission control has gone silent. You're alone in orbit. Talk yourself through the most beautiful sunset you've ever seen from space.",
      narrator: "Earth turns slowly below. The radio crackles with static. It's just you.",
    },
    {
      id: 'cosmos-5',
      text: "You intercept a signal from deep space — it's a song. Hum or describe what it sounds like, and what it makes you feel.",
      narrator: "The frequency pulses. Something out there is singing. And it's beautiful.",
    },
    {
      id: 'cosmos-6',
      text: "You have 60 seconds of fuel left. Leave a voice log about the one thing you'd do differently if you could go back to Earth.",
      narrator: "The engines sputter. The gauge reads empty. But your voice still carries.",
    },
  ],

  shadows: [
    {
      id: 'shadows-1',
      text: "You wake up in a forest with no memory. The only clue is a voice in your head saying one sentence. What is it?",
      narrator: "Mist curls between the trees. Something watches from the dark. Remember.",
    },
    {
      id: 'shadows-2',
      text: "A ghost appears and says it will answer one question truthfully. What do you ask, and how do you react to the answer?",
      narrator: "The candle dims. A figure forms in the smoke. It waits for your question.",
    },
    {
      id: 'shadows-3',
      text: "You find a mirror that shows not your face, but your truest self. Describe what you see.",
      narrator: "The glass ripples like water. The reflection isn't yours. Or maybe it finally is.",
    },
    {
      id: 'shadows-4',
      text: "A stranger offers you a potion — one sip and you'll forget your greatest heartbreak, but also the lessons it taught you. What do you decide, and why?",
      narrator: "The vial glows faintly in the dark. Forgetting is so tempting. But so is remembering.",
    },
    {
      id: 'shadows-5',
      text: "You're trapped in a labyrinth. The only way out is to confess something you've never said aloud. Speak.",
      narrator: "The walls shift and close. There is only one key, and it lives in your throat.",
    },
    {
      id: 'shadows-6',
      text: "A raven lands on your shoulder and says it can carry one message to anyone, living or dead. Who do you send it to and what do you say?",
      narrator: "Black feathers brush your cheek. The raven tilts its head. Speak, and it flies.",
    },
  ],
}

// World metadata for theming
export const worldMeta = {
  kingdom: {
    name: 'The Kingdom',
    emoji: '🏰',
    tagline: 'Where loyalty is forged in fire',
    gradient: 'from-amber-900/40 via-kingdom-purple/20 to-kingdom-darker',
    accentColor: 'kingdom-gold',
    bgClass: 'bg-gradient-kingdom',
  },
  cosmos: {
    name: 'The Cosmos',
    emoji: '🌌',
    tagline: 'Where stars align for two souls',
    gradient: 'from-indigo-900/40 via-blue-900/20 to-kingdom-darker',
    accentColor: 'blue-400',
    bgClass: 'bg-gradient-cosmos',
  },
  shadows: {
    name: 'The Shadows',
    emoji: '🌑',
    tagline: 'Where mystery speaks louder than light',
    gradient: 'from-emerald-900/30 via-slate-900/20 to-kingdom-darker',
    accentColor: 'emerald-400',
    bgClass: 'bg-gradient-shadows',
  },
}

// Recordings made before the three trials existed still show their question.
Object.values(worldPrompts).flat().forEach(q => {
  if (!questById[q.id]) questById[q.id] = { ...q, kind: 'legacy' }
})
