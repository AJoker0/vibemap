'use client'

import {
  Compass,
  Globe2,
  Layers3,
  MapPin,
  Settings2,
  Sparkles,
  Users,
} from 'lucide-react'

type City = {
  name: string
  places: number
}

type Friend = {
  name: string
  avatar: string
  mutual?: boolean
  daysAgo?: number
}

type MapSidebarProps = {
  name?: string
  email?: string
  selectedEmoji: string | null
  cities: City[]
  friends: Friend[]
  onOpenProfile: () => void
  onOpenGlobalVibes: () => void
  onOpenLayers: () => void
  onOpenSettings: () => void
}

export function MapSidebar({
  name,
  email,
  selectedEmoji,
  cities,
  friends,
  onOpenProfile,
  onOpenGlobalVibes,
  onOpenLayers,
  onOpenSettings,
}: MapSidebarProps) {
  const visibleCities = [...cities]
    .sort((a, b) => b.places - a.places)
    .slice(0, 4)
  const initials = (name || 'V').slice(0, 1).toUpperCase()

  return (
    <aside className="map-sidebar" aria-label="VibeMap navigation">
      <div className="map-sidebar__brand-row">
        <div className="map-sidebar__brand">
          <span className="map-sidebar__brand-mark" aria-hidden="true">
            <Compass size={17} strokeWidth={2.4} />
          </span>
          <span>VibeMap</span>
        </div>
        <span className="map-sidebar__live">
          <span aria-hidden="true" /> Live
        </span>
      </div>

      <button className="map-sidebar__identity" onClick={onOpenProfile}>
        <span className="map-sidebar__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="map-sidebar__identity-copy">
          <strong>{name || 'Vibe explorer'}</strong>
          <small>{email || 'Your personal map'}</small>
        </span>
        <span className="map-sidebar__identity-arrow" aria-hidden="true">
          {'->'}
        </span>
      </button>

      <div className="map-sidebar__section map-sidebar__current-vibe">
        <div className="map-sidebar__section-label">
          <Sparkles size={14} />
          Your signal
        </div>
        <div className="map-sidebar__signal-row">
          <span className="map-sidebar__signal-emoji">{selectedEmoji || '·'}</span>
          <span>
            <strong>{selectedEmoji ? 'Broadcasting now' : 'No signal yet'}</strong>
            <small>{selectedEmoji ? 'Visible for 24 hours' : 'Share a vibe from the map'}</small>
          </span>
        </div>
      </div>

      <div className="map-sidebar__stats" aria-label="Your map stats">
        <div>
          <strong>{cities.length}</strong>
          <span>cities</span>
        </div>
        <div>
          <strong>{friends.length}</strong>
          <span>friends</span>
        </div>
      </div>

      <div className="map-sidebar__section map-sidebar__places">
        <div className="map-sidebar__section-heading">
          <span>
            <MapPin size={14} /> Places you felt
          </span>
          <button onClick={onOpenProfile}>See all</button>
        </div>
        {visibleCities.length > 0 ? (
          <ol className="map-sidebar__city-list">
            {visibleCities.map((city, index) => (
              <li key={city.name}>
                <span className="map-sidebar__city-rank">0{index + 1}</span>
                <span className="map-sidebar__city-name">{city.name}</span>
                <span className="map-sidebar__city-count">{city.places}</span>
              </li>
            ))}
          </ol>
        ) : (
          <button className="map-sidebar__empty" onClick={onOpenProfile}>
            <MapPin size={16} />
            Your first place starts here
          </button>
        )}
      </div>

      <div className="map-sidebar__actions">
        <button onClick={onOpenGlobalVibes}>
          <Globe2 size={17} />
          <span>Global pulse</span>
        </button>
        <button onClick={onOpenLayers}>
          <Layers3 size={17} />
          <span>Map style</span>
        </button>
        <button onClick={onOpenSettings}>
          <Settings2 size={17} />
          <span>Settings</span>
        </button>
      </div>

      <div className="map-sidebar__footer">
        <Users size={14} />
        <span>{friends.length ? 'Your circle is moving with you' : 'Invite your circle to the map'}</span>
      </div>
    </aside>
  )
}
