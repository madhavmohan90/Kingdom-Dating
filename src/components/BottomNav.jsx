import { useNavigate } from 'react-router-dom'

const tabs = [
  { id: 'worlds', label: 'Voices', icon: '🔮', path: '/worlds' },
  { id: 'likes', label: 'Likes', icon: '💛', path: '/likes' },
  { id: 'chats', label: 'Chats', icon: '🎙️', path: '/chats' },
  { id: 'me', label: 'Me', icon: '🌙', path: '/me' },
]

export default function BottomNav({ active }) {
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50"
         style={{
           background: 'linear-gradient(to top, rgba(7,7,16,0.98) 0%, rgba(7,7,16,0.95) 60%, rgba(7,7,16,0.8) 100%)',
           backdropFilter: 'blur(12px)',
         }}>
      {/* Top gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-kingdom-gold/15 to-transparent" />

      <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 py-1.5 px-4 rounded-lg transition-all duration-200
              ${active === tab.id
                ? 'text-kingdom-gold'
                : 'text-white/30 hover:text-white/50'
              }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-[10px] font-medium tracking-wide ${
              active === tab.id ? 'font-display' : ''
            }`}>{tab.label}</span>
            {active === tab.id && (
              <div className="w-1 h-1 rounded-full bg-kingdom-gold mt-0.5" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
