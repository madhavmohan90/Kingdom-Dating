// In-world names. Nobody types a name in Kingdom Dating — the realm names you,
// and you speak your real name in your own recording.

const names = {
  male: ['Kael', 'Aldric', 'Doran', 'Theron', 'Rowan', 'Caius', 'Lorcan', 'Evander', 'Ronan', 'Soren', 'Alaric', 'Tavish'],
  female: ['Elara', 'Seraphine', 'Isolde', 'Lyra', 'Maeve', 'Rowena', 'Ysolde', 'Thalia', 'Selene', 'Aria', 'Freya', 'Neve'],
}

const titles = [
  'of the Moon', 'the Dragonborn', 'of the Night Woods', 'the Spellbound',
  'of the Silver Lake', 'the Wild', 'of the Burning Rose', 'the Moonlit',
  'of the Hidden Tower', 'the Starcaller',
]

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

export function generateAlias(gender) {
  return `${pick(names[gender] || names.male)} ${pick(titles)}`
}
