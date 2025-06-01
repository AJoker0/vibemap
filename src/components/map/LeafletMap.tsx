'use client';

import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

function LocateButton() {
  const map = useMap();

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation не поддерживается!');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 13);
        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup('Ты здесь!')
          .openPopup();
      },
      () => {
        alert('Не удалось получить локацию');
      }
    );
  }, [map]);

  return (
    <button
      onClick={handleLocate}
      type="button"
      aria-label="Найти меня"
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(37, 99, 235, 0.5)',
      }}
    >
      Найти меня
    </button>
  );
}

export function LeafletMap() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  const togglePicker = useCallback(() => setIsPickerOpen((open) => !open), []);
  const onEmojiSelect = useCallback(
    (emoji: any) => {
      const mood = emoji.native;
      setSelectedEmoji(mood);
      localStorage.setItem('user-mood', mood);
      setIsPickerOpen(false);
    },
    []
  );

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Mood picker button */}
      <button
        onClick={togglePicker}
        aria-label="Выбрать настроение"
        style={{
          position: 'fixed',
          top: '4rem',
          right: '1rem',
          zIndex: 1000,
          backgroundColor: '#db2777',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(219, 39, 119, 0.4)',
        }}
      >
        Мой вайб
      </button>

      {isPickerOpen && (
        <div
          style={{
            position: 'fixed',
            top: '5.5rem',
            right: '1rem',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
            maxWidth: '280px',
            maxHeight: '350px',
            overflowY: 'auto',
            padding: '0.5rem',
          }}
        >
          <Picker data={data} onEmojiSelect={onEmojiSelect} />
        </div>
      )}

      {selectedEmoji && (
        <div
          aria-live="polite"
          aria-label={`Выбранное настроение ${selectedEmoji}`}
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            fontSize: '2.5rem',
            zIndex: 1000,
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '0.25rem 0.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {selectedEmoji}
        </div>
      )}

      {/* Leaflet Map and LocateButton inside */}
      <MapContainer
        center={[42.6977, 23.3219]}
        zoom={5}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        />
        <LocateButton />
      </MapContainer>
    </div>
  );
}
