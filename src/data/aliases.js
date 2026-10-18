// In-world names. Nobody types a name in Kingdom Dating — the realm names you
// from your archetype, and bards speak their real name in their own recording.

const names = {
  male: ['Kael', 'Aldric', 'Doran', 'Theron', 'Rowan', 'Caius', 'Lorcan', 'Evander', 'Ronan', 'Soren', 'Alaric', 'Tavish'],
  female: ['Elara', 'Seraphine', 'Isolde', 'Lyra', 'Maeve', 'Rowena', 'Ysolde', 'Thalia', 'Selene', 'Aria', 'Freya', 'Neve'],
}

const epithets = {
  protector: 'the Shieldbearer',
  genius: 'the Sage',
  rebel: 'the Chainbreaker',
  romantic: 'the Heartsworn',
  commander: 'the Sovereign',
  adventurer: 'the Wayfarer',
  healer: 'the Gentle',
  wildcard: 'the Trickster',
}

export function generateAlias(gender, archetype) {
  const pool = names[gender] || names.male
  const first = pool[Math.floor(Math.random() * pool.length)]
  const epithet = epithets[archetype] || 'the Wanderer'
  return `${first} ${epithet}`
}
