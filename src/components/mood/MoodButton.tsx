//src/components/mood/MoodButton.tsx

import { useState } from 'react'
import { Popover } from '@headlessui/react'
import { Smile, Meh, Frown, Angry, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const emojis = [
  { label: 'Happy', icon: <Smile className="w-6 h-6 text-yellow-400" />, value: 'happy' },
  { label: 'Neutral', icon: <Meh className="w-6 h-6 text-gray-400" />, value: 'neutral' },
  { label: 'Sad', icon: <Frown className="w-6 h-6 text-blue-400" />, value: 'sad' },
  { label: 'Angry', icon: <Angry className="w-6 h-6 text-red-500" />, value: 'angry' },
  { label: 'Party', icon: <PartyPopper className="w-6 h-6 text-pink-400" />, value: 'party' },
]

export function MoodButton() {
  const [mood, setMood] = useState<string | null>(null)

  return (
    <Popover className="relative">
      <Popover.Button as={Button} variant="primary">
        {mood ? `Mood: ${mood}` : 'Set Mood'}
      </Popover.Button>

      <Popover.Panel className="absolute z-10 mt-2 p-2 bg-white border rounded shadow-md flex space-x-3">
        {emojis.map(({ label, icon, value }) => (
          <button
            key={value}
            onClick={() => setMood(value)}
            className="hover:scale-110 transition"
            title={label}
          >
            {icon}
          </button>
        ))}
      </Popover.Panel>
    </Popover>
  )
}
