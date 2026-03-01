import { router } from '@inertiajs/react'
import { useCallback, useRef, useState } from 'react'
import { uploadCoverPhoto, updateCoverPhotoPosition } from '@/actions/App/Http/Controllers/UserProfileController'

interface CoverPhotoProps {
    imageUrl: string | null
    positionY: number
    isOwner: boolean
}

export default function CoverPhoto({ imageUrl, positionY, isOwner }: CoverPhotoProps) {
    const [repositioning, setRepositioning] = useState(false)
    const [localPositionY, setLocalPositionY] = useState(positionY)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const dragStartRef = useRef<{ startY: number; startPosition: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        router.post(uploadCoverPhoto.url(), { cover_photo: file }, {
            preserveScroll: true,
            onFinish: () => {
                setUploading(false)
            },
        })

        e.target.value = ''
    }, [])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (!repositioning) return
        e.preventDefault()
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        dragStartRef.current = { startY: e.clientY, startPosition: localPositionY }
    }, [repositioning, localPositionY])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragStartRef.current || !containerRef.current) return
        const containerHeight = containerRef.current.getBoundingClientRect().height
        const deltaY = e.clientY - dragStartRef.current.startY
        const deltaPercent = (deltaY / containerHeight) * 100
        const newPosition = Math.max(0, Math.min(100, dragStartRef.current.startPosition + deltaPercent))
        setLocalPositionY(newPosition)
    }, [])

    const handlePointerUp = useCallback(() => {
        dragStartRef.current = null
    }, [])

    const handleSavePosition = useCallback(() => {
        setSaving(true)
        router.patch(updateCoverPhotoPosition.url(), { cover_photo_position_y: Math.round(localPositionY) }, {
            preserveScroll: true,
            onFinish: () => {
                setSaving(false)
                setRepositioning(false)
            },
        })
    }, [localPositionY])

    const handleCancelReposition = useCallback(() => {
        setLocalPositionY(positionY)
        setRepositioning(false)
    }, [positionY])

    return (
        <div
            ref={containerRef}
            className="relative h-32 w-full lg:h-48"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt=""
                    className={`h-full w-full object-cover ${repositioning ? 'cursor-grab active:cursor-grabbing' : ''}`}
                    style={{ objectPosition: `center ${repositioning ? localPositionY : positionY}%` }}
                    draggable={false}
                />
            ) : (
                <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-600" />
            )}

            {isOwner && !repositioning && (
                <div className="absolute right-4 bottom-4 z-20 flex gap-2">
                    {imageUrl && (
                        <button
                            type="button"
                            onClick={() => {
                                setLocalPositionY(positionY)
                                setRepositioning(true)
                            }}
                            className="rounded-md bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70"
                        >
                            Reposicionar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="rounded-md bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50"
                    >
                        {uploading ? 'Subiendo...' : 'Editar portada'}
                    </button>
                </div>
            )}

            {isOwner && repositioning && (
                <div className="absolute right-4 bottom-4 z-20 flex gap-2">
                    <button
                        type="button"
                        onClick={handleCancelReposition}
                        disabled={saving}
                        className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 backdrop-blur-sm hover:bg-white disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleSavePosition}
                        disabled={saving}
                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-indigo-500 disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            )}

            {isOwner && repositioning && (
                <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-md bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                    Arrastra para reposicionar
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    )
}
