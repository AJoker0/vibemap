import { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'ghost'
}

export function Input({ variant = 'default', className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        'px-4 py-2 text-sm rounded-md outline-none border transition w-full',
        variant === 'default' &&
          'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100',
        variant === 'ghost' && 'bg-transparent border-transparent focus:border-blue-400',
        className
      )}
      {...props}
    />
  )
}
