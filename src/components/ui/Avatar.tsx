// components/ui/Avatar.tsx
interface AvatarProps {
  src: string
  alt?: string
  size?: number
}

export const Avatar = ({ src, alt = 'Avatar', size = 40 }: AvatarProps) => {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover border border-gray-300"
    />
  )
}
