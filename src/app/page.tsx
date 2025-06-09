// src/app/page.tsx

'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getProfile } from '@/lib/api';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import AuthButtons from '../components/AuthButtons';

// ⛔ SSR disabled for Leaflet map
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
});

export default function HomePage() {
  const { user, token } = useAuth(); // ⬅️ добавлен token
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // 🧠 ⚠️ Пример правильной загрузки профиля
  useEffect(() => {
    const load = async () => {
      if (!token) return; // ⛔ Без токена ничего не грузим

      try {
        const data = await getProfile(token);
        console.log('✅ Профиль загружен:', data);
      } catch (err) {
        console.error('⚠️ Ошибка загрузки профиля:', err);
      }
    };

    load();
  }, [token]); // 🔁 Зависимость от токена

  if (!user) {
    return (
      <>
        <AuthButtons />
      </>
    );
  }

  return <LeafletMap />;
}
