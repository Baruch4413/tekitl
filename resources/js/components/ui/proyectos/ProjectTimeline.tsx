import { useEffect, useState } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { index as fetchTimeline } from '@/actions/App/Http/Controllers/ProjectTimelineController'
import ProjectTimelineEntry, { type TimelineEntry } from './ProjectTimelineEntry'
import ProjectTimelinePostUpdate from './ProjectTimelinePostUpdate'

interface ProjectTimelineProps {
    projectId: number
    initialEntries: TimelineEntry[]
    initialNextCursor: string | null
    isOwner: boolean
}

interface TimelinePageResponse {
    entries: TimelineEntry[]
    nextCursor: string | null
}

export default function ProjectTimeline({
    projectId,
    initialEntries,
    initialNextCursor,
    isOwner,
}: ProjectTimelineProps) {
    const [entries, setEntries] = useState<TimelineEntry[]>(initialEntries)
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setEntries(initialEntries)
        setNextCursor(initialNextCursor)
    }, [initialEntries, initialNextCursor])

    const loadMore = async () => {
        if (!nextCursor || loading) return
        setLoading(true)
        setError(null)
        try {
            const url = fetchTimeline.url(projectId, { query: { cursor: nextCursor } })
            const response = await fetch(url, { headers: { Accept: 'application/json' } })
            if (!response.ok) {
                throw new Error('Error de red')
            }
            const data: TimelinePageResponse = await response.json()
            setEntries((prev) => [...prev, ...data.entries])
            setNextCursor(data.nextCursor)
        } catch {
            setError('No se pudo cargar más actividad. Intentá de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-4 space-y-4">
            {isOwner && (
                <ProjectTimelinePostUpdate
                    projectId={projectId}
                    onSuccess={() => router.reload({ only: ['timeline'] })}
                />
            )}

            {entries.length === 0 ? (
                <div className="rounded-md border border-dashed border-gray-200 p-6 text-center dark:border-white/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Todavía no hay actividad en este proyecto.
                    </p>
                </div>
            ) : (
                <>
                    <ul className="divide-y divide-gray-100 dark:divide-white/5">
                        {entries.map((entry) => (
                            <ProjectTimelineEntry key={entry.id} entry={entry} />
                        ))}
                    </ul>

                    {nextCursor && (
                        <div className="flex justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={loading}
                                onClick={loadMore}
                            >
                                {loading ? 'Cargando…' : 'Cargar más'}
                            </Button>
                        </div>
                    )}

                    {error && <p className="text-center text-xs text-rose-500">{error}</p>}
                </>
            )}
        </div>
    )
}
