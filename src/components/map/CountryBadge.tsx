'use client';

import { useEffect, useState, CSSProperties } from 'react';

type Props = {
  coords: [number, number];
};

export function CountryBadge({ coords }: Props) {
  const [country, setCountry] = useState<string | null>(null);
  const [flagEmoji, setFlagEmoji] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords[0]}&lon=${coords[1]}&format=json&accept-language=en`
        );
        const data = await res.json();
        const countryName = data.address.country;
        const countryCode = data.address.country_code?.toUpperCase();

        setCountry(countryName);
        if (countryCode) {
          setFlagEmoji(getFlagEmoji(countryCode));
        }
      } catch (err) {
        console.error('Failed to fetch country', err);
      }
    };

    fetchCountry();
  }, [coords]);

  return (
    <div style={badgeStyle}>
      {flagEmoji && <span style={flagStyle}>{flagEmoji}</span>}
      {country && <span>{country}</span>}
    </div>
  );
}

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

// 🎨 Inline CSS Styles
const badgeStyle: CSSProperties = {
  position: 'absolute',
  top: '1.25rem',
  left: '1.25rem',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  borderRadius: '12px',
  padding: '0.55rem 1.25rem',
  boxShadow: '0 10px 28px rgba(0, 0, 0, 0.12)',
  fontWeight: 700,
  fontSize: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  zIndex: 1200,
  color: '#111827',
  fontFamily: 'Inter, Segoe UI, sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  userSelect: 'none'
};

const flagStyle: CSSProperties = {
  fontSize: '1.5rem',
  filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))',
};
