// Quest voice prompts organized by world
// Each world has its own atmosphere and quest style

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
    bgClass: 'bg-gradient-to-b from-indigo-950 via-slate-900 to-kingdom-darker',
  },
  shadows: {
    name: 'The Shadows',
    emoji: '🌑',
    tagline: 'Where mystery speaks louder than light',
    gradient: 'from-emerald-900/30 via-slate-900/20 to-kingdom-darker',
    accentColor: 'emerald-400',
    bgClass: 'bg-gradient-to-b from-slate-900 via-gray-900 to-kingdom-darker',
  },
}
