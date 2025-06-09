/*'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

export default function MoodDrop({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="absolute top-16 left-4 z-[1000]">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="bg-pink-500 text-white px-3 py-2 rounded shadow"
      >
        Выбери вайб
      </button>

      {showPicker && (
        <div className="mt-2 bg-white p-2 rounded shadow">
          <EmojiPicker
            onEmojiClick={(emojiData: EmojiClickData) => {
              onSelect(emojiData.emoji);
              setShowPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
*/
