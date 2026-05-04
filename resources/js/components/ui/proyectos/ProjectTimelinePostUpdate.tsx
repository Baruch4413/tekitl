import { FormEvent, useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import {
    storeMilestone,
    storeStatusUpdate,
} from '@/actions/App/Http/Controllers/ProjectTimelineController'

interface ProjectTimelinePostUpdateProps {
    projectId: number
    onSuccess?: () => void
}

type Tab = 'milestone' | 'status_update'

const MILESTONE_LIMIT = 120
const STATUS_LIMIT = 2000

export default function ProjectTimelinePostUpdate({
    projectId,
    onSuccess,
}: ProjectTimelinePostUpdateProps) {
    const [tab, setTab] = useState<Tab>('milestone')

    const milestoneForm = useForm<{ title: string }>({ title: '' })
    const statusForm = useForm<{ body: string }>({ body: '' })

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (tab === 'milestone') {
            milestoneForm.post(storeMilestone.url(projectId), {
                preserveScroll: true,
                onSuccess: () => {
                    milestoneForm.reset()
                    onSuccess?.()
                },
            })
        } else {
            statusForm.post(storeStatusUpdate.url(projectId), {
                preserveScroll: true,
                onSuccess: () => {
                    statusForm.reset()
                    onSuccess?.()
                },
            })
        }
    }

    const processing = milestoneForm.processing || statusForm.processing

    return (
        <div className="rounded-md border border-gray-200 p-4 dark:border-white/10">
            <div className="mb-3 flex gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant={tab === 'milestone' ? 'default' : 'outline'}
                    onClick={() => setTab('milestone')}
                >
                    Hito
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant={tab === 'status_update' ? 'default' : 'outline'}
                    onClick={() => setTab('status_update')}
                >
                    Actualización
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
                {tab === 'milestone' ? (
                    <>
                        <input
                            type="text"
                            name="title"
                            maxLength={MILESTONE_LIMIT}
                            placeholder="¿Qué hito alcanzaron?"
                            value={milestoneForm.data.title}
                            onChange={(e) => milestoneForm.setData('title', e.target.value)}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            {milestoneForm.errors.title ? (
                                <span className="text-red-600 dark:text-red-400">{milestoneForm.errors.title}</span>
                            ) : (
                                <span />
                            )}
                            <span>
                                {milestoneForm.data.title.length}/{MILESTONE_LIMIT}
                            </span>
                        </div>
                    </>
                ) : (
                    <>
                        <textarea
                            name="body"
                            maxLength={STATUS_LIMIT}
                            rows={4}
                            placeholder="Compartí una actualización con la comunidad…"
                            value={statusForm.data.body}
                            onChange={(e) => statusForm.setData('body', e.target.value)}
                            className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            {statusForm.errors.body ? (
                                <span className="text-red-600 dark:text-red-400">{statusForm.errors.body}</span>
                            ) : (
                                <span />
                            )}
                            <span>
                                {statusForm.data.body.length}/{STATUS_LIMIT}
                            </span>
                        </div>
                    </>
                )}

                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={processing}>
                        Publicar
                    </Button>
                </div>
            </form>
        </div>
    )
}
