'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
  ZoomControl,
} from 'react-leaflet'
import { MapTileProxyHandler, LocationMarkerFix, FindMeOptimizer } from './MapOptimizers'
import { TileProxyHandler } from './TileProxyHandler'
import '@/styles/marker-fixes.css' // Enhanced performance optimizations
import Supercluster from 'supercluster'
import type { Feature, Point } from 'geojson'
import * as L from 'leaflet';
import initLeaflet from '@/lib/initLeaflet'

// Import styles in correct order
import 'leaflet/dist/leaflet.css'
import '@/styles/buttons.css'
import '@/styles/map.css'
import '@/styles/marker-fixes.css' // New marker fixes
import { VibeSelector } from './VibeSelector'
import './vibe-selector.css'
import { MapLayerSelector } from './MapLayerSelector'
import { CountryBadge } from './CountryBadge'
import { SettingsModal } from '../settings/SettingsModal'
import { ProfileModal } from '../profile/ProfileModal'
import { getFriends, getCityFromCoords } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

type Friend = {
  name: string
  avatar: string
  mutual?: boolean
  daysAgo?: number
}

type City = {
  name: string
  places: number
}

type PointData = {
  id: number
  lat: number
  lng: number
  title: string
}

type PointProperties = {
  cluster: false
  pointId: number
  title: string
}

type ClusterProperties = {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated?: string | number
}

type ClusterOrPoint = Feature<Point, PointProperties | ClusterProperties>

const defaultPoints: PointData[] = [
  { id: 1, lat: 42.6977, lng: 23.3219, title: 'Sofia Center' },
  { id: 2, lat: 42.6988, lng: 23.322, title: 'Sofia North' },
]

const userIcon = new L.Icon({
  iconUrl: '/user-map-location.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28],
  className: 'user-location-marker',
  // Disable shadows for better performance
  shadowUrl: undefined,
  // Make marker image crisp on retina displays
  iconRetinaUrl: '/user-map-location.png',
  // Ensure marker stays on top
  pane: 'markerPane',
  // Add custom rendering properties
  riseOnHover: true,
  riseOffset: 1000
})

function Clusters({ points }: { points: PointData[] }) {
  const map = useMap()
  const [clusters, setClusters] = useState<ClusterOrPoint[]>([])
  const [supercluster, setSupercluster] =
    useState<Supercluster<PointProperties> | null>(null)

  useEffect(() => {
    const index = new Supercluster<PointProperties>({ radius: 60, maxZoom: 17 })
    const geoPoints = points.map((point) => ({
      type: 'Feature' as const,
      properties: {
        cluster: false as const,
        pointId: point.id,
        title: point.title,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [point.lng, point.lat],
      },
    }))
    index.load(geoPoints)
    setSupercluster(index)
  }, [points])

  useEffect(() => {
    if (!supercluster || !map) return
    const bounds = map.getBounds()
    const zoom = map.getZoom()
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]
    const newClusters = supercluster.getClusters(bbox, Math.round(zoom))
    setClusters(newClusters as ClusterOrPoint[])
  }, [map, supercluster])

  return (
    <>
      {clusters.map((cluster) => {
        const [lng, lat] = cluster.geometry.coordinates
        const props = cluster.properties
        return 'cluster' in props && props.cluster ? (
          <Marker
            key={`cluster-${props.cluster_id}`}
            position={[lat, lng]}
            eventHandlers={{
              click: () => {
                if (supercluster) {
                  const expansionZoom = Math.min(
                    supercluster.getClusterExpansionZoom(props.cluster_id),
                    17
                  )
                  map.setView([lat, lng], expansionZoom)
                }
              },
            }}
          >
            <Popup>Cluster of {props.point_count} points</Popup>
          </Marker>
        ) : (
          <Marker key={`point-${props.pointId}`} position={[lat, lng]}>
            <Popup>{props.title}</Popup>
          </Marker>
        )
      })}
    </>
  )
}

function MapWatcher({
  userLocation,
  onMoveAway,
}: {
  userLocation: [number, number] | null
  onMoveAway: () => void
}) {
  useMapEvents({
    moveend: (e) => {
      if (!userLocation) return
      const center = e.target.getCenter()
      const dist = Math.sqrt(
        Math.pow(center.lat - userLocation[0], 2) +
          Math.pow(center.lng - userLocation[1], 2)
      )
      if (dist > 0.005) {
        onMoveAway()
      }
    },
  })
  return null
}

export default function LeafletMap() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const [showFindMe, setShowFindMe] = useState(true)
  const [selectedLayer, setSelectedLayer] = useState('standard')
  const [isLayerSelectorOpen, setIsLayerSelectorOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [userFriends, setUserFriends] = useState<Friend[]>([])
  const [visitedCities, setVisitedCities] = useState<City[]>([])
  const [mapLoading, setMapLoading] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const { token } = useAuth()
    const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation not supported in this browser')
      return
    }

    // Set up a loading indicator
    setMapLoading(true);

    // Store location in localStorage to improve persistence
    const savedLocation = localStorage.getItem('user-last-location');
    let fallbackLocation: [number, number] | null = null;
    
    if (savedLocation) {
      try {
        const [lat, lng] = JSON.parse(savedLocation);
        if (typeof lat === 'number' && typeof lng === 'number') {
          fallbackLocation = [lat, lng];
          // Use saved location immediately while waiting for a more accurate one
          setUserLocation(fallbackLocation);
          // Since we have fallback, we can hide loading state sooner
          setTimeout(() => setMapLoading(false), 500);
        }
      } catch (e) {
        console.error('Failed to parse saved location', e);
      }
    }

    // Persistent tracking option - continuously update location if enabled
    let watchId: number | null = null;
    const persistentTracking = localStorage.getItem('persistent-tracking') === 'true';
    
    if (persistentTracking) {
      watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          const loc: [number, number] = [coords.latitude, coords.longitude];
          setUserLocation(loc);
          localStorage.setItem('user-last-location', JSON.stringify(loc));
        },
        null,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    }

    // Get initial position with high accuracy
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        console.log('📍 Geolocation success:', coords);
        const loc: [number, number] = [coords.latitude, coords.longitude];

        // Store the accurate location
        localStorage.setItem('user-last-location', JSON.stringify(loc));
        
        // Only try IP-based location if accuracy is very poor and we don't have a saved location
        if (coords.accuracy > 5000 && !fallbackLocation) {
          try {
            const ipToken = process.env.NEXT_PUBLIC_IPINFO_TOKEN;
            const res = await fetch(`https://ipinfo.io/json?token=${ipToken}`);
            if (res.ok) {
              const data = await res.json();
              if (data.loc) {
                const [lat, lng] = data.loc.split(',').map(Number);
                setUserLocation([lat, lng]);
                console.log(`⚠️ Using IP-based location due to poor GPS accuracy (${Math.round(coords.accuracy)}m)`);
                return;
              }
            }
          } catch (e) {
            console.error('❌ Failed to get IP-based coordinates:', e);
          }
        }
        
        setUserLocation(loc);
      },
      (err) => {
        console.error('❌ Geolocation error:', err);
        
        // Don't show the error if we already have a fallback location
        if (fallbackLocation) {
          console.log('Using saved location as fallback');
          return;
        }
        
        // Default location in case everything fails (centered on Europe)
        let defaultLocation: [number, number] = [48.8566, 2.3522]; // Paris coordinates as a default
        
        // Fall back to IP-based location if geolocation fails and we don't have a saved location
        fetch('https://ipinfo.io/json?token=' + process.env.NEXT_PUBLIC_IPINFO_TOKEN)
          .then(res => res.json())
          .then(data => {
            if (data.loc) {
              const [lat, lng] = data.loc.split(',').map(Number);
              setUserLocation([lat, lng]);
              // Save this location as a fallback for future
              localStorage.setItem('user-last-location', JSON.stringify([lat, lng]));
            } else {
              // If IP location fails too, use the default
              setUserLocation(defaultLocation);
            }
          })
          .catch(e => {
            console.error('IP location fallback failed', e);
            // Use default location as final fallback
            setUserLocation(defaultLocation);
          });
        
        // Show a brief notification instead of persistent error
        const errorMessage = err.code === 1 
          ? 'Location access denied. Using alternative location.'
          : 'Could not get your location. Using alternative location.';
          
        // Set error briefly, then clear it to avoid persistent UI issues
        setMapError(errorMessage);
        setTimeout(() => setMapError(null), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
    
    // Cleanup function
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);
  
  useEffect(() => {
    // Initialize Leaflet with proper configurations
    initLeaflet();
    
    // Add custom style element to ensure marker stability
    const addCustomStyles = () => {
      const styleId = 'custom-map-fixes';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          /* Apply hardware acceleration to the map container for smoother performance */
          .leaflet-container {
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            perspective: 1000px;
            will-change: transform;
            -webkit-font-smoothing: subpixel-antialiased;
          }

          /* Ensure map markers remain stable during animations */
          .leaflet-marker-icon, .leaflet-marker-shadow {
            transform: translateZ(0) !important;
            will-change: transform;
            transition: transform 0.1s ease-out !important;
          }
          
          /* Fix for marker z-index during zoom */
          .user-location-marker {
            z-index: 1000 !important;
          }

          /* Optimize tile transitions */
          .leaflet-tile {
            transform: translateZ(0);
            will-change: transform, opacity;
          }

          /* Smooth panning */
          .leaflet-container {
            scroll-behavior: smooth;
          }
        `;
        document.head.appendChild(styleEl);
      }
    };
    
    addCustomStyles();

    // Disable certain animations on mobile devices for better performance
    const disableHeavyAnimations = () => {
      const isMobile = window.innerWidth < 768 || 
                      ('ontouchstart' in window) || 
                      (navigator.maxTouchPoints > 0);
      
      if (isMobile) {
        L.DomUtil.addClass(document.body, 'mobile-map-optimizations');
      }
    };

    disableHeavyAnimations();
      // Performance optimization: Add frame throttling for smoother panning
    const throttleMapAnimations = () => {
      // Define a custom property using type assertion
      const originalPanBy = L.Map.prototype.panBy;
      L.Map.prototype.panBy = function(offset, options) {
        const map = this as any; // Type assertion to avoid TS errors
        if (!map._panAnimRequestId) {
          map._panAnimRequestId = requestAnimationFrame(() => {
            originalPanBy.call(this, offset, options);
            map._panAnimRequestId = null;
          });
        }
        return this;
      };
    };
    
    throttleMapAnimations();
  }, []);

  useEffect(() => {
    requestGeolocation();
    
    // Clean browser cache of tiles if there are issues
    const clearTileCacheIfNeeded = () => {
      const lastClearTime = localStorage.getItem('map-tile-cache-cleared');
      const now = Date.now();
      
      // If it's been more than a day since last clearing or never cleared
      if (!lastClearTime || (now - parseInt(lastClearTime)) > 86400000) {
        // Clear leaflet tile cache
        localStorage.removeItem('leaflet-tile-cache');
        localStorage.setItem('map-tile-cache-cleared', now.toString());
        console.log('🧹 Map tile cache cleared - daily maintenance');
      }
    };
    
    clearTileCacheIfNeeded();
  }, [requestGeolocation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return;
        const friends = await getFriends(token);
        const visitsRes = await fetch('http://localhost:5000/visits', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const visits = await visitsRes.json();
        const cityCounts: Record<string, number> = {};
        visits.forEach((v: { city: string }) => {
          cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
        });
        const cities = Object.entries(cityCounts).map(([name, places]) => ({
          name,
          places,
        }));
        setUserFriends(friends);
        setVisitedCities(cities);
      } catch (error) {
        console.error('💥 Error loading data:', error);
      }
    };
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setSettingsOpen(false);
        setIsOpen(false);
        setIsLayerSelectorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
    const centerMapToUser = () => {
    if (mapRef.current && userLocation) {
      // Show visual feedback that location is being updated
      const button = document.querySelector('.button.find-me');
      if (button) {
        button.textContent = '📍 Finding...';
        button.classList.add('finding');
        
        // Add a style for smoother animation
        button.setAttribute('style', 'transform: translateZ(0); will-change: transform;');
      }
      
      // Trigger the "hiding" of the button immediately for better UX
      setShowFindMe(false);
      
      // First pan to the location smoothly (smoother than flyTo)
      // This provides instant feedback
      mapRef.current.setView(userLocation, mapRef.current.getZoom(), {
        animate: true,
        duration: 0.3,
        easeLinearity: 0.25,
        noMoveStart: true // Prevents triggering unnecessary events
      });
      
      // Prepare for smoother zoom animation
      setTimeout(() => {
        // Then smoothly zoom in to user's location
        mapRef.current?.flyTo(userLocation, 15, {
          animate: true,
          duration: 0.8, // Faster animation for better UX
          easeLinearity: 0.2, // More natural easing
          noMoveStart: true // Prevents triggering unnecessary events
        });
      }, 100); // Small timeout to separate pan from zoom for smoother feel
      
      // Then try to get more current position with shorter timeout
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const freshLocation: [number, number] = [coords.latitude, coords.longitude];
            
            // Only update if position has changed significantly to avoid unnecessary movement
            const distanceMoved = mapRef.current ? 
              mapRef.current.distance(userLocation, freshLocation) : 0;
              
            if (distanceMoved > 10) { // Only move if more than 10 meters different
              setUserLocation(freshLocation);
              
              // Adjust to the fresh location with smoother animation
              mapRef.current?.panTo(freshLocation, {
                animate: true,
                duration: 0.6,
                easeLinearity: 0.1 // Very smooth panning
              });
              
              localStorage.setItem('user-last-location', JSON.stringify(freshLocation));
            }
          },
          () => {
            // If getting current position fails, we already moved to the last known position
            console.log('Using last known position as fallback');
          },
          {
            enableHighAccuracy: true,
            timeout: 5000, // shorter timeout for better response
            maximumAge: 10000 // Accept positions up to 10 seconds old for faster response
          }
        );
      }
    }
  };

  if (!userLocation) {
    return (
      <div className="geo-loader-screen">
        <div className="geo-loader-card">
          <div className="geo-icon">📡</div>
          <div className="geo-text">Getting geolocation...</div>
          <div className="geo-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      <FindMeOptimizer />
      {userLocation && <CountryBadge coords={userLocation} />}
      <div className="top-right-ui">
        <button
          className="profile-button"
          onClick={() => {
            setProfileOpen((wasOpen) => {
              if (!wasOpen) setSettingsOpen(false);
              return !wasOpen;
            });
          }}
          aria-label="Profile"
          title="Profile"
        >
          👤
        </button>

        <button
          className="settings-button"
          onClick={() => {
            setSettingsOpen((wasOpen) => {
              if (!wasOpen) setProfileOpen(false);
              return true;
            });
          }}
          aria-label="Settings"
          title="Settings"
        >
          ⚙️
        </button>

        <div className="layer-switch-wrapper">
          <button
            onClick={() => {
              setIsLayerSelectorOpen((wasOpen) => !wasOpen);
            }}
            className={`map-style-toggle ${isLayerSelectorOpen ? 'no-shadow' : ''}`}
            aria-label="Map style"
            title="Map style"
          >
            🌐
          </button>

          {isLayerSelectorOpen && (
            <div className="map-style-popup">
              <MapLayerSelector
                layers={[
                  { id: 'standard', name: 'Standard', icon: '🗺️' },
                  { id: 'satellite', name: 'Satellite', icon: '🛰️' },
                  { id: 'relief', name: 'Relief', icon: '🏔️' },
                  { id: 'dark', name: 'Dark', icon: '🟣' },
                  { id: 'light', name: 'Light', icon: '🟡' },
                ]}
                current={selectedLayer}
                onSelect={(id) => {
                  setSelectedLayer(id);
                  setIsLayerSelectorOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {profileOpen && (
        <ProfileModal
          onClose={() => setProfileOpen(false)}
          friends={userFriends}
          cities={visitedCities}
        />
      )}
      
      <div className={`map-wrapper ${mapLoading ? 'loading' : ''}`}>
        <div className="map-loading-spinner">🌐</div>
        {mapError && (
          <div className="map-error-message">
            Error loading map: {mapError}
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}          <MapContainer
          center={userLocation}
          zoom={13}          scrollWheelZoom={true}
          attributionControl={true}
          zoomControl={false}
          style={{ 
            height: '100%', 
            width: '100%',
            // Add hardware acceleration for smoother rendering
            transform: 'translate3d(0,0,0)',
            WebkitBackfaceVisibility: 'hidden',
            backfaceVisibility: 'hidden'
          }}
          // Performance optimized settings
          zoomAnimation={window.innerWidth > 768} // Disable on mobile
          fadeAnimation={window.innerWidth > 768} // Disable on mobile
          markerZoomAnimation={false} // Disable for better performance
          preferCanvas={true} // Use canvas renderer for better performance
          renderer={L.canvas({ padding: 0.5 })}
          // Add world boundary limits
          minZoom={2}
          maxZoom={18}
          worldCopyJump={true}
          // Don't use maxBounds as it can cause stuttering
          // Use preferCanvas for better mobile performance
          ref={(ref) => {
            if (ref && !mapRef.current) {
              mapRef.current = ref;
              // Apply smoother panning settings
              ref.options.inertia = true;
              ref.options.inertiaDeceleration = 3000; // Higher value for smoother inertia
              ref.options.inertiaMaxSpeed = 1500; // Lower for smoother panning
              ref.options.zoomSnap = 0.5;
              ref.options.zoomDelta = 0.5;
              ref.options.wheelDebounceTime = 100; // Reduce scroll wheel stuttering
              // Enable tap handler for mobile if available
              if ('tap' in ref.options) {
                (ref.options as any).tap = true; // Better touch handling
              }

              // Add event listeners for tile loading
              ref.on('tileerror', (e) => {
                console.error('Tile error:', e);
                setMapError(`Failed to load some map tiles. Please check your connection.`);
              });
              ref.on('tileloadstart', () => setMapLoading(true));
              ref.on('tileload', () => setMapLoading(false));
            }
          }}
        >          <TileLayer
            attribution={
              selectedLayer === 'standard'
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                : selectedLayer === 'satellite'
                ? '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                : selectedLayer === 'relief'
                ? 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                : selectedLayer === 'dark'
                ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }
            url={
              selectedLayer === 'standard'
                ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                : selectedLayer === 'satellite'
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'                : selectedLayer === 'relief'
                ? '/api/tile-proxy?url=https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
                : selectedLayer === 'dark'
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
                : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
            }            
            errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            maxZoom={19}
            tileSize={256}
            keepBuffer={5} // Increase buffer for smoother scrolling
            updateWhenZooming={false} // Don't update tiles during zoom
            updateWhenIdle={true} // Only update when user stops moving
            zoomOffset={0}
            zIndex={1}
            detectRetina={true}
            crossOrigin="anonymous"
            subdomains="abc"
            className="map-tiles"
            eventHandlers={{
              loading: () => {
                setMapLoading(true);
              },
              load: () => {
                setMapLoading(false);
              },
              tileerror: (e) => {
                console.warn('Tile error - attempting to reload', e);
                // Don't show errors for brief connection issues
                setTimeout(() => {
                  if (document.querySelectorAll('.leaflet-tile-loaded').length < 5) {
                    setMapError('Map tile loading issues. Check your connection.');
                  }
                }, 3000);
              }
            }}
            // Add preload of adjacent tiles for smoother experience
            bounds={mapRef.current?.getBounds()}
            // Enable pane to control rendering order and optimize
            pane="tilePane"
          />          <Marker 
            position={userLocation} 
            icon={userIcon}
            zIndexOffset={1000}
            pane="markerPane"
            eventHandlers={{
              add: (e) => {
                // Force the marker element to have the highest z-index
                const el = e.target.getElement();
                if (el) {
                  el.style.zIndex = "1000";
                  el.style.transform = "translate3d(0,0,0)";
                  el.style.position = "relative";
                }
              }
            }}
          >
            <Popup>🧍 You are here!</Popup>
          </Marker>

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
          <MapWatcher
            userLocation={userLocation}
            onMoveAway={() => setShowFindMe(true)}
          />          <ZoomControl position="bottomright" />
          <MapTileProxyHandler />
          <LocationMarkerFix />
          <TileProxyHandler />
        </MapContainer>
      </div>

      {!showFindMe ? (
        <>
          <button className="button vibe" onClick={() => setIsOpen(!isOpen)}>
            <span className="icon">🎭</span>
            My Vibe
          </button>
          {isOpen && (
            <VibeSelector
              onSelect={async (emoji: string) => {
                setSelectedEmoji(emoji);
                localStorage.setItem('user-mood', emoji);
                if (userLocation) {
                  const city = await getCityFromCoords(
                    userLocation[0],
                    userLocation[1]
                  );
                  await fetch('http://localhost:5000/visits', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      lat: userLocation[0],
                      lng: userLocation[1],
                      city,
                      timestamp: new Date().toISOString(),
                      emoji,
                    }),
                  });
                }
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
