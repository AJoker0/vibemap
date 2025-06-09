// src/components/ui/Input/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: 'default' | 'error' | 'success'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'px-3 py-2 border rounded-md text-sm outline-none transition-all',
          variant === 'default' &&
            'border-gray-300 focus:ring-2 focus:ring-blue-500',
          variant === 'error' &&
            'border-red-500 focus:ring-2 focus:ring-red-400',
          variant === 'success' &&
            'border-green-500 focus:ring-2 focus:ring-green-400',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
