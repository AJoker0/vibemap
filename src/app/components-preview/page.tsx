//src/app/components-preview/page.tsx

'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Avatar } from '@/components/ui/Avatar'
import { Tooltip } from '@/components/ui/Tooltip'
import { Modal } from '@/components/ui/Modal'
import { GoogleSignInButton } from '@/components/GoogleSignInButton'
import MapView from '@/components/map/MapView'

export default function ComponentPreview() {
  const [open, setOpen] = useState(false)
  const { data: session, status } = useSession()

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Компоненты UI</h1>

      {/* ✅ Google Auth Section */}
      {status === 'loading' ? (
        <p>Загрузка...</p>
      ) : session?.user ? (
        <div className="flex items-center gap-4">
          <Avatar src={session.user.image || '/user.png'} alt="avatar" />
          <span>{session.user.name}</span>
          <Button onClick={() => signOut()} variant="ghost">
            Выйти
          </Button>
        </div>
      ) : (
        <GoogleSignInButton />
      )}

      <Button variant="primary">Primary</Button>
      <Button variant="ghost">Ghost</Button>

      <MapView /> {/* <- карта */}

      <Input placeholder="Введите что-то..." />
      <Input variant="ghost" placeholder="Ghost input" />
      <Textarea placeholder="Оставь тут свой вайб..." />
      <Checkbox label="Принять правила вайбов" />
      <Avatar src="/user.png" alt="Аватар" />
      <Tooltip content="Это тултип">
        <span className="underline cursor-help">Наведи сюда</span>
      </Tooltip>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-4">Это модалка!</div>
      </Modal>
    </div>
  )
}

