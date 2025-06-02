'use client';

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import Supercluster from 'supercluster';
import type { Feature, Point } from 'geojson';
import L from 'leaflet';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

import '@/styles/buttons.css';

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
  { id: 2, lat: 42.6988, lng: 23.3220, title: 'Sofia North' },
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
    const geoPoints: Feature<Point, PointProperties>[] = points.map((point) => ({
      type: 'Feature',
      properties: { cluster: false, pointId: point.id, title: point.title },
      geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
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

export function LeafletMap() {
  const [geoStatus, setGeoStatus] = useState('🔄 Запрашиваю координаты...');
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

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

  useEffect(() => { requestGeolocation(); }, [requestGeolocation]);

  if (!userLocation) return <div className="center">📡 Получаем геопозицию...</div>;

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <MapContainer center={userLocation} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Clusters points={defaultPoints} />
        <Marker position={userLocation} icon={userIcon}><Popup>🧍 Ты здесь</Popup></Marker>
      </MapContainer>

      <button className="button" onClick={() => setIsOpen(true)}>Мой вайб</button>

      {isOpen && (
        <div className="emoji-picker-popup">
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              const mood = emoji.native;
              setSelectedEmoji(mood);
              localStorage.setItem('user-mood', mood);
              setIsOpen(false);
            }}
          />
        </div>
      )}

      {selectedEmoji && (
        <div className="emoji-indicator">{selectedEmoji}</div>
      )}

      {userCoords && (
        <div className="coordinates-box">
          <strong>📍 Координаты:</strong><br />
          Широта: {userCoords[0].toFixed(6)}<br />
          Долгота: {userCoords[1].toFixed(6)}<br />
          <strong>{geoStatus}</strong>
        </div>
      )}

      
    </div>
  );
}
