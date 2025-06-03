//src/components/map/MoodDrawer.tsx

'use client';

import { useState } from 'react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

export const MoodDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');

  const handleSelect = (emoji: any) => {
    const mood = emoji.native;
    setSelectedEmoji(mood);
    localStorage.setItem('user-mood', mood);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-pink-500 text-white px-3 py-2 rounded shadow absolute z-[1000] bottom-4 left-4"
      >
        Мой вайб
      </button>

      {isOpen && (
        <div className="absolute bottom-16 left-4 z-[1000] bg-white rounded shadow p-2">
          <Picker data={data} onEmojiSelect={handleSelect} />
        </div>
      )}

      {selectedEmoji && (
        <div className="absolute bottom-4 right-4 z-[1000] text-4xl">
          {selectedEmoji}
        </div>
      )}
    </>
  );
};
