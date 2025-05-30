// components/ui/Tooltip.tsx
import { ReactNode, useState } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div className="absolute z-10 mt-2 w-max px-2 py-1 text-xs text-white bg-black rounded">
          {content}
        </div>
      )}
    </div>
  )
}
