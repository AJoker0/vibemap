// src/components/map/MapLayerSelector.tsx
'use client';

import './MapLayerSelector.css';

export function MapLayerSelector({ layers, current, onSelect }: {
  layers: { id: string, name: string, icon: string }[],
  current: string,
  onSelect: (id: string) => void
}) {
  return (
    <div className="map-layer-selector">
      {layers.map((layer) => (
        <button
          key={layer.id}
          className={`layer-btn ${current === layer.id ? 'active' : ''}`}
          onClick={() => onSelect(layer.id)}
        >
          <span className="icon">{layer.icon}</span>
          <span className="label">{layer.name}</span>
        </button>
      ))}
    </div>
  );
}
