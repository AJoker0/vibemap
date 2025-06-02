import '../styles/globals.css'
import 'leaflet/dist/leaflet.css';
import '@/styles/buttons.css'; // ⬅️ ВАЖНО: абсолютный путь из root

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
