import { useRef, useState, type DragEvent } from 'react'
import { router } from '@inertiajs/react'
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import InlineSaveButton from '@/components/ui/InlineSaveButton'
import { uploadImage, deleteImage, updateImage } from '@/actions/App/Http/Controllers/ProjectController'

interface ProjectImage {
    id: number
    title: string | null
    description: string | null
    thumbnailUrl: string
    mediumUrl: string
    largeUrl: string
}

interface ImageGalleryProps {
    images: ProjectImage[]
    isOwner: boolean
    projectId: number
}

const BENTO_SLOTS = [
    { col: 'lg:col-span-4', roundedClass: 'max-lg:rounded-t-4xl lg:rounded-tl-4xl' },
    { col: 'lg:col-span-2', roundedClass: 'lg:rounded-tr-4xl' },
    { col: 'lg:col-span-2', roundedClass: 'lg:rounded-bl-4xl' },
    { col: 'lg:col-span-4', roundedClass: 'max-lg:rounded-b-4xl lg:rounded-br-4xl' },
]

function UploadPlaceholder({
    slot,
    projectId,
}: {
    slot: (typeof BENTO_SLOTS)[number]
    projectId: number
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)

    const handleFile = (file: File) => {
        router.post(uploadImage.url(projectId), { image: file } as Record<string, File>, {
            forceFormData: true,
            preserveScroll: true,
            only: ['project'],
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
        })
    }

    const handleDrop = (e: DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) {
            handleFile(file)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFile(file)
        }
        e.target.value = ''
    }

    return (
        <div className={`flex p-px ${slot.col}`}>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`flex w-full flex-col items-center justify-center gap-y-3 overflow-hidden rounded-lg bg-gray-50 py-12 outline outline-black/5 transition-colors ${slot.roundedClass} ${dragging ? 'bg-indigo-50 outline-indigo-300 dark:bg-indigo-950/30 dark:outline-indigo-500' : 'hover:bg-gray-100 dark:bg-gray-800/50 dark:outline-white/10 dark:hover:bg-gray-800'}`}
            >
                <div className={`flex size-14 items-center justify-center rounded-full border-2 border-dashed transition-colors ${dragging ? 'border-indigo-400 text-indigo-500 dark:border-indigo-400 dark:text-indigo-400' : 'border-gray-300 text-gray-400 dark:border-white/20 dark:text-gray-500'}`}>
                    <CameraIcon className="size-7" />
                </div>
                <div className="text-center">
                    <p className={`text-sm font-medium ${dragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        Arrastra una imagen aquí
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        o haz clic para seleccionar (4MB max)
                    </p>
                </div>
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />
        </div>
    )
}

function BentoImageCard({
    image,
    slot,
    isOwner,
    projectId,
}: {
    image: ProjectImage
    slot: (typeof BENTO_SLOTS)[number]
    isOwner: boolean
    projectId: number
}) {
    const [editingTitle, setEditingTitle] = useState(false)
    const [editingDescription, setEditingDescription] = useState(false)
    const [title, setTitle] = useState(image.title ?? '')
    const [description, setDescription] = useState(image.description ?? '')

    const saveField = (field: 'title' | 'description') => {
        const data = field === 'title' ? { title } : { description }
        router.patch(updateImage.url({ project: projectId, image: image.id }), data, {
            preserveScroll: true,
            only: ['project'],
            onSuccess: () => {
                if (field === 'title') {
                    setEditingTitle(false)
                }
                if (field === 'description') {
                    setEditingDescription(false)
                }
            },
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
        })
    }

    const handleDelete = () => {
        router.delete(deleteImage.url({ project: projectId, image: image.id }), {
            preserveScroll: true,
            only: ['project'],
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
        })
    }

    return (
        <div className={`flex p-px ${slot.col}`}>
            <div className={`group relative w-full overflow-hidden rounded-lg bg-white shadow-sm outline outline-black/5 ${slot.roundedClass} dark:bg-gray-800 dark:shadow-none dark:outline-white/15`}>
                <img
                    src={image.mediumUrl}
                    srcSet={`${image.thumbnailUrl} 300w, ${image.mediumUrl} 800w, ${image.largeUrl} 1600w`}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    alt={image.title ?? ''}
                    className="h-52 w-full object-cover"
                />
                {isOwner && (
                    <Button
                        type="button"
                        onClick={handleDelete}
                        size="icon"
                        className="absolute top-3 right-3 hidden size-8 bg-black/60 text-white hover:bg-black/80 group-hover:block"
                    >
                        <XMarkIcon className="size-4" />
                    </Button>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-6 backdrop-blur-xs opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Title */}
                    {isOwner && editingTitle ? (
                        <div
                            className="flex items-center gap-x-2"
                            onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                    setTitle(image.title ?? '')
                                    setEditingTitle(false)
                                }
                            }}
                        >
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveField('title')
                                    if (e.key === 'Escape') { setTitle(image.title ?? ''); setEditingTitle(false) }
                                }}
                                autoFocus
                                placeholder="Título de la imagen"
                                className="h-9 w-full rounded-xl border border-white/20 bg-white/10 px-3 text-lg font-medium text-white placeholder-white/50 focus:border-indigo-400 focus:outline-none"
                            />
                            <InlineSaveButton onClick={() => saveField('title')} />
                        </div>
                    ) : (
                        <p
                            onClick={() => isOwner && setEditingTitle(true)}
                            className={`text-lg font-medium tracking-tight text-white px-3 ${isOwner ? 'cursor-pointer rounded-xl px-2 py-1 transition-colors hover:bg-white/15' : ''}`}
                        >
                            {image.title || (isOwner ? 'Agregar título' : '')}
                        </p>
                    )}

                    {/* Description */}
                    {isOwner && editingDescription ? (
                        <div
                            className="mt-2 flex flex-col gap-y-1.5"
                            onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget)) {
                                    setDescription(image.description ?? '')
                                    setEditingDescription(false)
                                }
                            }}
                        >
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') { setDescription(image.description ?? ''); setEditingDescription(false) }
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        saveField('description')
                                    }
                                }}
                                autoFocus
                                rows={3}
                                placeholder="Descripción de la imagen"
                                className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-gray-200 placeholder-white/50 focus:border-indigo-400 focus:outline-none"
                            />
                            <div className="flex justify-end">
                                <InlineSaveButton onClick={() => saveField('description')} />
                            </div>
                        </div>
                    ) : (
                        <p
                            onClick={() => isOwner && setEditingDescription(true)}
                            className={`mt-2 whitespace-pre-line text-sm/6 text-gray-300 px-3 ${isOwner ? 'cursor-pointer rounded-xl px-2 py-1 transition-colors hover:bg-white/15' : ''}`}
                        >
                            {image.description || (isOwner ? 'Agregar descripción' : '')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ImageGallery({ images, isOwner, projectId }: ImageGalleryProps) {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-6 lg:grid-rows-2">
            {BENTO_SLOTS.map((slot, index) => {
                const image = images[index]

                if (image) {
                    return (
                        <BentoImageCard
                            key={image.id}
                            image={image}
                            slot={slot}
                            isOwner={isOwner}
                            projectId={projectId}
                        />
                    )
                }

                if (isOwner) {
                    return (
                        <UploadPlaceholder
                            key={`placeholder-${index}`}
                            slot={slot}
                            projectId={projectId}
                        />
                    )
                }

                return null
            })}
        </div>
    )
}
