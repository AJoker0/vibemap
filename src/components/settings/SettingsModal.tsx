'use client';

import { useEffect, useState } from 'react';
import './settings-modal.css';
import { getProfile, updateProfile, ProfileUpdate } from '@/lib/api';
import { useAuth } from '@/context/AuthContext'; // ✅ ДОБАВИЛ ЭТО

type Profile = {
  name: string;
  avatar: string;
  birthday?: string;
  username?: string;
  notifications?: boolean;
};

type Props = {
  onClose: () => void;
};

export function SettingsModal({ onClose }: Props) {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    avatar: '/user.png',
    birthday: '',
    username: '',
    notifications: false,
  });

  const [toastVisible, setToastVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [notifications, setNotifications] = useState(false);
  const [birthday, setBirthday] = useState('');

  const { token } = useAuth(); // ✅ ВЫНЕС token в scope всего компонента

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login'; // или другой маршрут, если нужен
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      const data = await getProfile(token);

      setProfile(data);
      setUsername(data.username || '');
      setNotifications(data.notifications ?? false);
      setBirthday(data.birthday || '1995-08-07');
    };
    fetchData();
  }, [token]);

  const checkUsername = async () => {
    try {
      if (!token) return false;
      const res = await fetch(`http://localhost:5000/check-username?username=${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      if (data.taken) {
        setUsernameError('❌ Taken');
        return false;
      }
      setUsernameError('');
      return true;
    } catch (err) {
      console.error('⚠️ Username check failed:', err);
      setUsernameError('⚠️ Error checking username');
      return false;
    }
  };

  const handleSave = async () => {
    if (!token || usernameError) return;
    const isValid = await checkUsername();
    if (!isValid) return;

    try {
      await updateProfile({ ...profile, birthday, username, notifications }, token);
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    } catch (err) {
      console.error('❌ Failed to save:', err);
    }
  };

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="settings-title">⚙️ SETTINGS</h2>

        <section>
          <h3 className="section-title">PROFILE</h3>
          <div className="row">
            <span>Picture</span>
            <img src={profile.avatar} alt="avatar" className="avatar" />
          </div>
          <div className="row">
            <span>Name</span>
            <span className="dimmed">{profile.name}</span>
          </div>
          <div className="row column">
            <label>Username</label>
            <input
              type="text"
              className={`input-text ${usernameError ? 'error' : ''}`}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError('');
              }}
              onBlur={checkUsername}
            />
            {usernameError && <span className="error-text">{usernameError}</span>}
          </div>

          <div className="row">
            <span>Birthday</span>
            <input
              type="date"
              className="input-date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
            />
          </div>

          <div className="row">
            <span>Friends</span>
            <span className="dimmed">1</span>
          </div>
          <div className="row">
            <span>Blocked users</span>
            <span className="dimmed">0</span>
          </div>
        </section>

        <section>
          <h3 className="section-title">PREFERENCES</h3>
          <div className="row">
            <span>Notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => {
                setNotifications(e.target.checked);
                if (e.target.checked && Notification.permission !== 'granted') {
                  Notification.requestPermission();
                }
              }}
            />
          </div>
        </section>

        <div className="save-wrapper">
          <button
            className="save-settings-btn"
            onClick={handleSave}
            disabled={!!usernameError}
          >
            💾 Save
          </button>

          <button
            className="logout-btn"
            onClick={handleLogout}
            type="button"
          >
            🚪 Logout
          </button>
          
        </div>
      </div>

      {toastVisible && (
        <div className="toast-popup">
          <span className="toast-icon">🎉</span>
          <span>Saved successfully!</span>
        </div>
      )}
    </div>
  );
}
