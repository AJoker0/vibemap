// src/components/ui/Button.tsx
import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
//import React from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export const Button = ({ variant = 'primary', className, ...props }: Props) => {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-md text-sm font-semibold transition',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'ghost' && 'bg-transparent text-blue-600 hover:underline',
        className
      )}
      {...props}
    />
  )
}
