// components/ui/Checkbox.tsx
import { InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = ({ label, ...props }: CheckboxProps) => {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      {label}
    </label>
  )
}
