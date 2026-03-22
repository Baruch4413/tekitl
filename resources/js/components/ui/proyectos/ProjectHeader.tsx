import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import InlineSaveButton from '@/components/ui/InlineSaveButton'
import UserAvatar from '@/components/ui/UserAvatar'
import { show as userProfile } from '@/actions/App/Http/Controllers/UserProfileController'
import { update as updateProject } from '@/actions/App/Http/Controllers/ProjectController'

interface ProjectHeaderProps {
    projectId: number
    title: string | null
    description: string | null
    user: { id: number; name: string; imageUrl: string | null }
    date: string
    dateTime: string
    isOwner: boolean
}

export default function ProjectHeader({ projectId, title, description, user, date, dateTime, isOwner }: ProjectHeaderProps) {
    const [editingTitle, setEditingTitle] = useState(false)
    const [editingDescription, setEditingDescription] = useState(false)
    const [titleValue, setTitleValue] = useState(title ?? '')
    const [descriptionValue, setDescriptionValue] = useState(description ?? '')

    const saveField = (field: 'title' | 'description') => {
        router.patch(updateProject.url(projectId), {
            title: field === 'title' ? titleValue : (title ?? ''),
            description: field === 'description' ? descriptionValue : (description ?? ''),
        }, {
            preserveScroll: true,
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

    return (
        <div className="mb-6">
            {/* Title */}
            {isOwner && editingTitle ? (
                <div
                    className="flex items-center gap-x-2"
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                            setTitleValue(title ?? '')
                            setEditingTitle(false)
                        }
                    }}
                >
                    <input
                        type="text"
                        value={titleValue}
                        onChange={(e) => setTitleValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveField('title')
                            if (e.key === 'Escape') { setTitleValue(title ?? ''); setEditingTitle(false) }
                        }}
                        autoFocus
                        className="h-9 w-full rounded-xl border border-gray-300 px-3 text-2xl font-bold text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="Título del proyecto"
                    />
                    <InlineSaveButton onClick={() => saveField('title')} />
                </div>
            ) : (
                <h1
                    onClick={() => isOwner && setEditingTitle(true)}
                    className={`text-2xl font-bold text-gray-900 dark:text-white px-3 ${isOwner ? 'cursor-pointer rounded-xl pr-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5' : ''}`}
                >
                    {title || (isOwner ? 'Haz clic para agregar un título' : 'Sin título')}
                </h1>
            )}

            {/* User info */}
            <div className="mt-3 flex items-center gap-x-3">
                <Link href={userProfile.url(user.id)}>
                    <UserAvatar name={user.name} imageUrl={user.imageUrl} />
                </Link>
                <div>
                    <Link href={userProfile.url(user.id)} className="text-sm font-bold text-gray-900 hover:underline dark:text-white">
                        {user.name}
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        <time dateTime={dateTime}>{date}</time>
                    </p>
                </div>
            </div>

            {/* Description */}
            <div className="mt-4">
                {isOwner && editingDescription ? (
                    <div
                        className="flex flex-col gap-y-2"
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) {
                                setDescriptionValue(description ?? '')
                                setEditingDescription(false)
                            }
                        }}
                    >
                        <textarea
                            value={descriptionValue}
                            onChange={(e) => setDescriptionValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') { setDescriptionValue(description ?? ''); setEditingDescription(false) }
                            }}
                            autoFocus
                            rows={4}
                            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                            placeholder="Descripción del proyecto"
                        />
                        <div className="flex justify-end">
                            <InlineSaveButton onClick={() => saveField('description')} />
                        </div>
                    </div>
                ) : (
                    <p
                        onClick={() => isOwner && setEditingDescription(true)}
                        className={`text-sm text-gray-700 dark:text-gray-300 px-3 ${isOwner ? 'cursor-pointer rounded-xl pr-3 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-white/5' : ''}`}
                    >
                        {description || (isOwner ? 'Haz clic para agregar una descripción' : '')}
                    </p>
                )}
            </div>
        </div>
    )
}
