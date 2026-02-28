const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-24 text-3xl sm:size-32 sm:text-4xl',
} as const

interface UserAvatarProps {
    name: string
    imageUrl?: string | null
    size?: keyof typeof sizeClasses
    className?: string
}

export default function UserAvatar({ name, imageUrl, size = 'md', className = '' }: UserAvatarProps) {
    const sizeClass = sizeClasses[size]

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt=""
                className={`${sizeClass} shrink-0 rounded-full bg-gray-100 object-cover outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10 ${className}`}
            />
        )
    }

    return (
        <span
            className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600 outline -outline-offset-1 outline-black/5 dark:bg-indigo-900 dark:text-indigo-300 dark:outline-white/10 ${className}`}
        >
            {name.charAt(0).toUpperCase()}
        </span>
    )
}
