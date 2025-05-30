'use client';

// src/app/components-preview/page.tsx
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Checkbox } from '@/components/ui/Checkbox'
import { Avatar } from '@/components/ui/Avatar'
import { Tooltip } from '@/components/ui/Tooltip'
import { Modal } from '@/components/ui/Modal'
import { useState } from 'react'



export default function ComponentPreview() {
    const [open, setOpen] = useState(false)
  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">Компоненты UI</h1>

      <Button variant="primary">Primary</Button>
      <Button variant="ghost">Ghost</Button>

    <Input placeholder="Введите что-то..." />
    <Input variant="ghost" placeholder="Ghost input" />

      {/* Сюда будем добавлять Input, Avatar, Modal и т.д. */}
    </div>
  )
}




{/* Внутри твоей preview страницы */}

