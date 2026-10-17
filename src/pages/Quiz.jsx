import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const questions = [
  {
    id: 1,
    prompt: "A stranger is being harassed in a tavern. You...",
    options: [
      { text: "Step in and shield them", archetype: "protector" },
      { text: "Outsmart the aggressor with words", archetype: "genius" },
      { text: "Flip the table and cause chaos", archetype: "rebel" },
      { text: "Comfort the stranger afterward", archetype: "healer" },
    ]
  },
  {
    id: 2,
    prompt: "You discover a hidden map. Your first thought?",
    options: [
      { text: "Adventure awaits — let's go", archetype: "adventurer" },
      { text: "Study it. Knowledge is power", archetype: "genius" },
      { text: "Rally a team to explore", archetype: "commander" },
      { text: "Write a poem about the mystery", archetype: "romantic" },
    ]
  },
  {
    id: 3,
    prompt: "At a royal feast, where do people find you?",
    options: [
      { text: "At the head of the table, leading stories", archetype: "commander" },
      { text: "Sneaking into the kitchen to taste everything", archetype: "adventurer" },
      { text: "In the corner, deep in conversation with one person", archetype: "romantic" },
      { text: "Doing something completely unexpected", archetype: "wildcard" },
    ]
  },
  {
    id: 4,
    prompt: "A friend betrays your trust. You...",
    options: [
      { text: "Confront them directly, with fairness", archetype: "protector" },
      { text: "Cut them off without a word", archetype: "rebel" },
      { text: "Try to understand why they did it", archetype: "healer" },
      { text: "Plot an elaborate but harmless revenge", archetype: "wildcard" },
    ]
  },
  {
    id: 5,
    prompt: "Your deepest desire is...",
    options: [
      { text: "To be someone's safe place", archetype: "protector" },
      { text: "To change the world", archetype: "rebel" },
      { text: "To love and be loved completely", archetype: "romantic" },
      { text: "To live without regrets", archetype: "adventurer" },
    ]
  },
]

const archetypeInfo = {
  protector: { name: "The Protector", emoji: "🛡️" },
  genius: { name: "The Genius", emoji: "🧠" },
  rebel: { name: "The Rebel", emoji: "⚡" },
  romantic: { name: "The Romantic", emoji: "🌹" },
  commander: { name: "The Commander", emoji: "👑" },
  adventurer: { name: "The Adventurer", emoji: "🗺️" },
  healer: { name: "The Healer", emoji: "✨" },
  wildcard: { name: "The Wildcard", emoji: "🃏" },
}

export default function Quiz() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)

  const question = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  const handleSelect = (option) => {
    setSelected(option)

    // Tally archetype scores
    const newAnswers = { ...answers }
    newAnswers[option.archetype] = (newAnswers[option.archetype] || 0) + 1
    setAnswers(newAnswers)

    // Auto-advance after brief delay
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1)
        setSelected(null)
      } else {
        // Quiz complete — find dominant archetype
        const sorted = Object.entries(newAnswers).sort((a, b) => b[1] - a[1])
        const result = sorted[0][0]

        // Save to Supabase and navigate
        saveArchetype(result)
      }
    }, 600)
  }

  const saveArchetype = async (archetype) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ archetype }).eq('id', user.id)
    }
    navigate('/archetype', { state: { archetype } })
  }

  return (
    <div className="min-h-screen bg-gradient-kingdom flex flex-col px-6 py-12">
      <div className="max-w-md mx-auto w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-white/40 text-xs mb-2">
            <span>Quest {current + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="animate-fade-in" key={current}>
          <p className="text-white/40 text-sm mb-3 font-medium tracking-wider uppercase">
            The Oracle Asks...
          </p>
          <h2 className="font-display text-xl md:text-2xl text-white mb-8 leading-relaxed">
            {question.prompt}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                disabled={selected !== null}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300
                  ${selected === option
                    ? 'bg-kingdom-gold/20 border-kingdom-gold text-kingdom-gold scale-[1.02]'
                    : selected !== null
                      ? 'opacity-40 border-white/5 bg-white/3'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8 active:scale-[0.98]'
                  }`}
              >
                <span className="text-sm">{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
