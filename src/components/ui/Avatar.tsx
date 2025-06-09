// components/ui/Avatar.tsx
import Image from 'next/image'

interface AvatarProps {
  src: string
  alt?: string
  size?: number
}

export const Avatar = ({ src, alt = 'Avatar', size = 40 }: AvatarProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover border border-gray-300"
    />
  )
}
