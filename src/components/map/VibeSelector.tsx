'use client'

import { useEffect, useRef, useState } from 'react'

const emojis = ['😊', '😆', '😐', '😢', '🛹', '🎉', '❤️', '👀', '💔', '🚆']

export function VibeSelector({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Функция для сброса таймера
  const resetTimeout = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    const newTimeoutId = setTimeout(onClose, 8000)
    setTimeoutId(newTimeoutId)
  }

  // Обработчик взаимодействия с панелью
  const handleInteraction = () => {
    resetTimeout()
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Начальный таймер и очистка при размонтировании
  useEffect(() => {
    const initialTimeoutId = setTimeout(onClose, 8000)
    setTimeoutId(initialTimeoutId)

    return () => {
      if (initialTimeoutId) {
        clearTimeout(initialTimeoutId)
      }
    }
  }, [onClose])

  // Обработчик выбора эмодзи с сбросом таймера
  const handleEmojiSelect = (emoji: string) => {
    handleInteraction()
    onSelect(emoji)
  }

  return (
    <>
      <style jsx>{`
        .vibe-selector-wrapper {
          position: fixed;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: auto;
          padding: 0 10px;
          box-sizing: border-box;
          width: 100%;
          max-width: 600px;
        }

        .vibe-selector-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 25px;
          padding: 15px 20px;
          box-shadow: 
            0 20px 40px rgba(0, 0, 0, 0.15),
            0 10px 20px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: nowrap;
          animation: slideUpFade 0.4s ease-out;
        }

        .vibe-selector-content button {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border: 2px solid rgba(148, 163, 184, 0.2);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
        }

        .vibe-selector-content button:hover {
          transform: translateY(-3px) scale(1.1);
          background: linear-gradient(135deg, #ffffff, #f1f5f9);
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.15),
            0 5px 15px rgba(99, 102, 241, 0.2);
        }

        .vibe-selector-content button:active {
          transform: translateY(-1px) scale(1.05);
        }

        .vibe-selector-content button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          transition: left 0.5s;
        }

        .vibe-selector-content button:hover::before {
          left: 100%;
        }

        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 💻 Десктопные стили - все эмодзи видны */
        @media (min-width: 769px) {
          .vibe-selector-wrapper {
            max-width: 600px;
          }
          
          .vibe-selector-content {
            justify-content: space-between;
            gap: 12px;
            overflow: visible;
          }
        }

        /* 📱 Мобильные стили - горизонтальная прокрутка */
        @media (max-width: 768px) {
          .vibe-selector-wrapper {
            bottom: 140px;
            padding: 0 15px;
            max-width: calc(100vw - 30px);
          }

          .vibe-selector-content {
            padding: 12px 16px;
            gap: 8px;
            border-radius: 20px;
            justify-content: flex-start;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            scroll-behavior: smooth;
          }

          .vibe-selector-content::-webkit-scrollbar {
            display: none;
          }

          .vibe-selector-content button {
            width: 45px;
            height: 45px;
            font-size: 22px;
            min-width: 45px;
          }
        }

        @media (max-width: 480px) {
          .vibe-selector-wrapper {
            bottom: 150px;
            padding: 0 10px;
            max-width: calc(100vw - 20px);
          }

          .vibe-selector-content {
            padding: 10px 12px;
            gap: 6px;
            border-radius: 18px;
          }

          .vibe-selector-content button {
            width: 40px;
            height: 40px;
            font-size: 20px;
            min-width: 40px;
          }
        }

        @media (max-width: 360px) {
          .vibe-selector-content {
            padding: 8px 10px;
            gap: 4px;
          }

          .vibe-selector-content button {
            width: 36px;
            height: 36px;
            font-size: 18px;
            min-width: 36px;
          }
        }
      `}</style>

      <div 
        ref={ref} 
        className="vibe-selector-wrapper"
        onMouseEnter={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <div 
          className="vibe-selector-content"
          onScroll={handleInteraction}
          onTouchMove={handleInteraction}
        >
          {emojis.map((emoji) => (
            <button 
              key={emoji} 
              onClick={() => handleEmojiSelect(emoji)}
              onMouseEnter={handleInteraction}
              onTouchStart={handleInteraction}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}