'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import Supercluster from 'supercluster';
import type { Feature, Point } from 'geojson';
import L from 'leaflet';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import '@/styles/buttons.css';
import { useRef } from 'react';
import { VibeSelector } from './VibeSelector';
import './vibe-selector.css';
import { CountryWatcher } from './CountryWatcher';
import { CountryBadge } from './CountryBadge';




type PointData = {
  id: number;
  lat: number;
  lng: number;
  title: string;
};

type PointProperties = {
  cluster: false;
  pointId: number;
  title: string;
};

type ClusterProperties = {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated?: string | number;
};

type ClusterOrPoint = Feature<Point, PointProperties | ClusterProperties>;

const defaultPoints: PointData[] = [
  { id: 1, lat: 42.6977, lng: 23.3219, title: 'Sofia Center' },
  { id: 2, lat: 42.6988, lng: 23.322, title: 'Sofia North' },
];

const userIcon = new L.Icon({
  iconUrl: '/user-map-location.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  className: 'user-location-marker',
});

function Clusters({ points }: { points: PointData[] }) {
  const map = useMap();
  const [clusters, setClusters] = useState<ClusterOrPoint[]>([]);
  const [supercluster, setSupercluster] = useState<Supercluster<PointProperties> | null>(null);

  useEffect(() => {
    const index = new Supercluster<PointProperties>({ radius: 60, maxZoom: 17 });
    const geoPoints = points.map((point) => ({
  type: 'Feature' as const,
  properties: {
    cluster: false as false,
    pointId: point.id,
    title: point.title,
  },
  geometry: {
    type: 'Point' as const,
    coordinates: [point.lng, point.lat],
  },
}));
    index.load(geoPoints);
    setSupercluster(index);
  }, [points]);

  useEffect(() => {
    if (!supercluster || !map) return;
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    const bbox: [number, number, number, number] = [
      bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth(),
    ];
    const newClusters = supercluster.getClusters(bbox, Math.round(zoom));
    setClusters(newClusters as ClusterOrPoint[]);
  }, [map, supercluster]);

  return (
    <>
      {clusters.map((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates;
        const props = cluster.properties;
        return 'cluster' in props && props.cluster ? (
          <Marker key={`cluster-${props.cluster_id}`} position={[lat, lng]} eventHandlers={{
            click: () => {
              if (supercluster) {
                const zoom = supercluster.getClusterExpansionZoom(props.cluster_id);
                map.setView([lat, lng], zoom);
              }
            },
          }}>
            <Popup>Cluster of {props.point_count} points</Popup>
          </Marker>
        ) : (
          <Marker key={`point-${props.pointId}`} position={[lat, lng]}>
            <Popup>{props.title}</Popup>
          </Marker>
        );
      })}
    </>
  );
}

// ✅ Следим за перемещением карты
function MapWatcher({
  userLocation,
  onMoveAway,
}: {
  userLocation: [number, number] | null;
  onMoveAway: () => void;
}) {
  useMapEvents({
    moveend: (e) => {
      if (!userLocation) return;
      const center = e.target.getCenter();
      const dist = Math.sqrt(
        Math.pow(center.lat - userLocation[0], 2) + Math.pow(center.lng - userLocation[1], 2)
      );
      if (dist > 0.005) {
        onMoveAway();
      }
    },
  });
  return null;
}

export function LeafletMap() {
  const [geoStatus, setGeoStatus] = useState('🔄 Запрашиваю координаты...');
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [showFindMe, setShowFindMe] = useState(true);
  const [coordsForCountryBadge, setCoordsForCountryBadge] = useState<[number, number] | null>(null);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('❌ Геолокация не поддерживается!');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const loc: [number, number] = [coords.latitude, coords.longitude];
        setGeoStatus('✅ Координаты получены!');
        setUserCoords(loc);
        setUserLocation(loc);
      },
      (err) => {
        setGeoStatus(`❌ Ошибка геолокации: ${err.message}`);
      }
    );
  }, []);

  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  const centerMapToUser = () => {
    if (mapRef.current && userLocation) {
  mapRef.current.setView(userLocation, 16);
  setShowFindMe(false);
}
  };

  if (!userLocation) return <div className="center">📡 Получаем геопозицию...</div>;

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* 🔥 Показываем страну в левом верхнем углу */}
    {userLocation && <CountryBadge coords={userLocation} />}
    
    {coordsForCountryBadge && <CountryBadge coords={coordsForCountryBadge} />}
      <MapContainer 
        center={userLocation}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
          ref={(ref) => {
          if (ref && !mapRef.current) {
            mapRef.current = ref;
          }
        }}

        
      >
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={userLocation} icon={userIcon}>
          <Popup>🧍 Ты здесь</Popup>
        </Marker>

         {/* 🔥 Эмодзи как отдельный Marker */}
  {selectedEmoji && (
    <Marker
      position={userLocation}
      icon={
        new L.DivIcon({
          html: `<div style="font-size: 26px; transform: translateY(-35px);">${selectedEmoji}</div>`,
          className: 'emoji-overlay',
          iconSize: [0, 0],
        })
      }
      interactive={false}
    />
  )}

        <Clusters points={defaultPoints} />
        <MapWatcher userLocation={userLocation} onMoveAway={() => setShowFindMe(true)} />
      </MapContainer>

      {!showFindMe ? (
  <>
    <button className="button vibe" onClick={() => setIsOpen(!isOpen)}>
      <span className="icon">🎭</span>
      Мой вайб
    </button>

    {isOpen && (
      <VibeSelector
  onSelect={(emoji: string) => {
    setSelectedEmoji(emoji);
    localStorage.setItem('user-mood', emoji);
    setIsOpen(false);
  }}
  onClose={() => setIsOpen(false)}
/>

    )}
  </>
) : (
  <button className="button find-me" onClick={centerMapToUser}>
    <span className="icon">📍</span>
    Find Me
  </button>
)}
      
    </div>
  );
}
