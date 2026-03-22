import { useCallback, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { CameraIcon, EyeIcon } from '@heroicons/react/20/solid'
import { toast } from 'sonner'
import { updateAvatar } from '@/actions/App/Http/Controllers/Settings/ProfileController'
import UserAvatar from '@/components/ui/UserAvatar'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface ProfileAvatarProps {
    name: string
    imageUrl: string | null
    baseUrl: string | null
    originalUrl: string | null
    isOwner: boolean
}

export default function ProfileAvatar({ name, imageUrl, baseUrl, originalUrl, isOwner }: ProfileAvatarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [viewerOpen, setViewerOpen] = useState(false)

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        router.post(updateAvatar.url(), { avatar: file }, {
            preserveScroll: true,
            onFinish: () => setUploading(false),
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
        })

        e.target.value = ''
    }, [])

    return (
        <>
            <div className="group relative flex">
                <UserAvatar
                    name={name}
                    imageUrl={imageUrl}
                    baseUrl={baseUrl}
                    size="lg"
                    className="ring-4 ring-white dark:ring-gray-950"
                />

                {isOwner && imageUrl && (
                    <div className="absolute inset-0 overflow-hidden rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                        {/* Top half – upload */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute inset-x-0 top-0 flex h-1/2 cursor-pointer flex-col items-center justify-center bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-50"
                        >
                            <CameraIcon className="size-5" />
                            <span className="mt-0.5 text-[10px] font-medium leading-tight">
                                {uploading ? 'Subiendo...' : 'Actualizar'}
                            </span>
                        </button>

                        {/* Divider */}
                        <div className="absolute inset-x-0 top-1/2 z-10 h-px bg-white/60" />

                        {/* Bottom half – view */}
                        <button
                            type="button"
                            onClick={() => setViewerOpen(true)}
                            className="absolute inset-x-0 bottom-0 flex h-1/2 cursor-pointer flex-col items-center justify-center bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                        >
                            <EyeIcon className="size-5" />
                            <span className="mt-0.5 text-[10px] font-medium leading-tight">Ver</span>
                        </button>
                    </div>
                )}

                {isOwner && !imageUrl && (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center rounded-full opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100"
                    >
                        <CameraIcon className="size-5 text-white" />
                        <span className="mt-0.5 text-[10px] font-medium leading-tight text-white">
                            {uploading ? 'Subiendo...' : 'Actualizar'}
                        </span>
                    </button>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>

            <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
                <DialogContent className="max-w-lg p-2 sm:max-w-xl">
                    {originalUrl && (
                        <img
                            src={originalUrl}
                            alt={name}
                            className="w-full rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
