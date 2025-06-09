'use client'

import { useEffect, useState, CSSProperties } from 'react'

type Props = {
  coords: [number, number]
}

export function CountryBadge({ coords }: Props) {
  const [country, setCountry] = useState<string | null>(null)
  const [flagEmoji, setFlagEmoji] = useState<string | null>(null)

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords[0]}&lon=${coords[1]}&format=json&accept-language=en`
        )
        const data = await res.json()
        const countryName = data.address.country
        const countryCode = data.address.country_code?.toUpperCase()

        setCountry(countryName)
        if (countryCode) {
          setFlagEmoji(getFlagEmoji(countryCode))
        }
      } catch (err) {
        console.error('❌ Failed to fetch country:', err)
      }
    }

    fetchCountry()
  }, [coords])

  return (
    <div style={zenBadgeStyle}>
      {flagEmoji && <span style={zenFlagStyle}>{flagEmoji}</span>}
      {country && <span style={zenNameStyle}>{country.toUpperCase()}</span>}
    </div>
  )
}

function getFlagEmoji(countryCode: string) {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
}

// 🎨 Inline styles (Zenly inspired)
const zenBadgeStyle: CSSProperties = {
  position: 'absolute',
  top: '1rem',
  left: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  padding: '0.6rem 1rem',
  borderRadius: '14px',
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#111827',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  zIndex: 1100,
  transition: 'all 0.3s ease',
}

const zenFlagStyle: CSSProperties = {
  fontSize: '1.4rem',
}

const zenNameStyle: CSSProperties = {
  fontFamily: `'Inter', 'Segoe UI', sans-serif`,
  fontWeight: 700,
  letterSpacing: '0.4px',
  color: '#111827',
  textTransform: 'uppercase',
}
