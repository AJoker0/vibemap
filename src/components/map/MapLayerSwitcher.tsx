'use client'

import { LayersControl, TileLayer } from 'react-leaflet'

export function MapLayerSwitcher() {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name="Standard">
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="🛰 Satellite">
        <TileLayer
          attribution="Tiles © Esri"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="🗺 Relief (Terrain)">
        <TileLayer
          attribution="© OpenTopoMap"
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="🌑 Dark">
        <TileLayer
          attribution="CartoDB Dark"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
      </LayersControl.BaseLayer>

      <LayersControl.BaseLayer name="🌕 Light">
        <TileLayer
          attribution="CartoDB Light"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
      </LayersControl.BaseLayer>
    </LayersControl>
  )
}
