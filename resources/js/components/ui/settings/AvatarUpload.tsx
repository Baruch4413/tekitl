interface AvatarUploadProps {
    imageUrl?: string | null
    name: string
}

export default function AvatarUpload({ imageUrl, name }: AvatarUploadProps) {
    return (
        <div className="flex items-center gap-x-8">
            {imageUrl ? (
                <img
                    alt=""
                    src={imageUrl}
                    className="size-24 flex-none rounded-lg bg-gray-100 object-cover outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                />
            ) : (
                <span className="flex size-24 flex-none items-center justify-center rounded-lg bg-indigo-100 text-3xl font-bold text-indigo-600 outline -outline-offset-1 outline-black/5 dark:bg-indigo-900 dark:text-indigo-300 dark:outline-white/10">
                    {name.charAt(0).toUpperCase()}
                </span>
            )}
            <div>
                <button
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring-1 inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                >
                    Cambiar foto
                </button>
                <p className="mt-2 text-xs/5 text-gray-500 dark:text-gray-400">JPG, GIF o PNG. 1MB máx.</p>
            </div>
        </div>
    )
}
