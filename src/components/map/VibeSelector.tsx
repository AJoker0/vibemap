    'use client';

    import { useEffect, useRef } from 'react';
    //import '@/components/map/vibe-selector.css';


    

    const emojis = ['😊', '😆', '😐', '😢', '🛹', '🎉', '❤️', '👀', '💔', '🚆'];

    export function VibeSelector({
    onSelect,
    onClose,
    }: {
    onSelect: (emoji: string) => void;
    onClose: () => void;
    }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            onClose();
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        const timeout = setTimeout(onClose, 8000);
        return () => clearTimeout(timeout);
    }, [onClose]);

    return (
        <div ref={ref} className="vibe-selector-wrapper active">
  <div className="vibe-selector-content">
    {emojis.map((emoji) => (
      <button
        key={emoji}
        onClick={() => onSelect(emoji)}
      >
        {emoji}
      </button>
    ))}
  </div>
</div>

    );
    }
