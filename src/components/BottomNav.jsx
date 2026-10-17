import { useNavigate } from 'react-router-dom'

const tabs = [
  { id: 'worlds', label: 'Worlds', icon: '🏰', path: '/worlds' },
  { id: 'likes', label: 'Likes', icon: '💛', path: '/likes' },
  { id: 'chats', label: 'Chats', icon: '🎙️', path: '/chats' },
  { id: 'me', label: 'Me', icon: '👤', path: '/me' },
]

export default function BottomNav({ active }) {
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-kingdom-darker/95 backdrop-blur-md border-t border-white/10 z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-lg mx-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-colors
              ${active === tab.id
                ? 'text-kingdom-gold'
                : 'text-white/40 hover:text-white/60'
              }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
