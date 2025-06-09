// src/components/profile/ProfileModal.tsx

'use client';

import { useEffect, useState } from 'react';
import './profile-modal.css';
import { getProfile, updateProfile } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type Visit = {
  lat: number;
  lng: number;
  city: string;
  timestamp: string;
  emoji: string;
};

type Friend = {
  name: string;
  avatar: string;
  mutual?: boolean;
  daysAgo?: number;
};

type City = {
  name: string;
  places: number;
};

type Props = {
  onClose: () => void;
  friends: Friend[];
  cities: City[];
};

export function ProfileModal({ onClose, friends, cities }: Props) {
  const [avatar, setAvatar] = useState('/user.png');
  const [name, setName] = useState('Loading...');
  const [activeTab, setActiveTab] = useState<'friends' | 'cities'>('friends');
  const [showSaved, setShowSaved] = useState(false);
  const [topCity, setTopCity] = useState<City | null>(null);

  const { token } = useAuth();

  useEffect(() => {
  const fetchProfile = async () => {
    if (!token) return; // 🛑 Без токена не выходим в сеть

    try {
      const profile = await getProfile(token);
      const visitsRes = await fetch('http://localhost:5000/visits', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!visitsRes.ok) throw new Error('Failed to fetch visits');

      const visits: Visit[] = await visitsRes.json();
      setName(profile.name);
      setAvatar(profile.avatar);

      const cityCounts: Record<string, number> = {};
      visits.forEach((v) => {
        cityCounts[v.city] = (cityCounts[v.city] || 0) + 1;
      });

      const sorted = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        setTopCity({ name: sorted[0][0], places: sorted[0][1] });
      }

    } catch (err) {
      console.error('❌ fetchProfile error:', err);
    }
  };

  if (token) {
    fetchProfile();
  }
}, [token]); // 🔁 запускается только когда token будет готов


  const handleSave = async () => {
  if (!token) {
    console.error('❌ No token, cannot save profile');
    return;
  }

  try {
    console.log('🔐 Saving with token:', token);

    const res = await fetch('http://localhost:5000/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, avatar }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData?.error || 'Unknown error');
    }

    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  } catch (error) {
    console.error('❌ Save failed:', error);
  }
};


  return (
    <div className="profile-backdrop" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <div className="avatar-wrapper">
            <label className="avatar-interactive" title="Change photo">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        setAvatar(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <img className="avatar-pic" src={avatar} alt="avatar" />
              <span className="camera-icon">📷</span>
            </label>
          </div>

          <div className="name-save-container">
            <div className="name-edit-group">
              <input
                className="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="edit-pencil">✏️</span>
            </div>

            <div className="save-button-wrapper">
              <button className="save-btn" onClick={handleSave}>
                💾 Save
              </button>
              {showSaved && <span className="save-toast">Saved ✅</span>}
            </div>
          </div>
        </div>

        {topCity && (
          <div className="top-city-card">
            <div className="top-label">TOP CITY</div>
            <h3>{topCity.name}</h3>
            <p className="badge">{topCity.places} places</p>
            <div className="extra">📍 based on moods</div>
          </div>
        )}

        <div className="tab-switcher">
          <button
            onClick={() => setActiveTab('friends')}
            className={activeTab === 'friends' ? 'active' : ''}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={activeTab === 'cities' ? 'active' : ''}
          >
            Cities
          </button>
        </div>

        {activeTab === 'friends' ? (
          <div className="friends-list">
            {friends.map((friend, index) => (
              <div className="friend-row" key={index}>
                <img src={friend.avatar} alt={friend.name} />
                <span className="friend-name">{friend.name}</span>
                {friend.mutual && <span className="mutual">mutual</span>}
                {friend.daysAgo && <span className="dimmed">{friend.daysAgo} days</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="cities-list">
            {cities.map((city, index) => (
              <div className="city-row" key={index}>
                <h5>{city.name}</h5>
                <p className="badge">{city.places} places</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
