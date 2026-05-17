import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ProjectTimeline from '@/components/ui/proyectos/ProjectTimeline'
import type { TimelineEntry } from '@/components/ui/proyectos/ProjectTimelineEntry'

vi.mock('@inertiajs/react', () => ({
    router: { reload: vi.fn() },
    useForm: () => ({
        data: { title: '', body: '' },
        setData: vi.fn(),
        post: vi.fn(),
        reset: vi.fn(),
        processing: false,
        errors: {},
    }),
    usePage: () => ({
        props: {
            locale: 'es',
            translations: {
                projects: {
                    timeline_entry: {
                        milestone: 'Hito:',
                        status_update: 'Actualización:',
                        stage_transition_separator: 'a',
                    },
                    timeline_post_update: {
                        milestone_placeholder: '¿Qué hito alcanzaron?',
                        status_placeholder: 'Compartí una actualización con la comunidad…',
                    },
                },
            },
        },
    }),
}))

const makeEntry = (id: number, body: string): TimelineEntry => ({
    id,
    type: 'status_update',
    data: { body },
    createdAt: new Date(2026, 0, id).toISOString(),
    createdAtRelative: 'hace un rato',
    actor: { id: 1, name: 'Owner', avatarUrl: null },
})

describe('ProjectTimeline', () => {
    it('renders initial entries from props', () => {
        const entries = [makeEntry(1, 'first'), makeEntry(2, 'second')]
        render(
            <ProjectTimeline
                projectId={1}
                initialEntries={entries}
                initialNextCursor={null}
                isOwner={false}
            />,
        )
        expect(screen.getByText('first')).toBeInTheDocument()
        expect(screen.getByText('second')).toBeInTheDocument()
    })

    it('syncs entries when initialEntries prop changes (after partial reload)', () => {
        const original = [makeEntry(1, 'old')]
        const { rerender } = render(
            <ProjectTimeline
                projectId={1}
                initialEntries={original}
                initialNextCursor={null}
                isOwner={false}
            />,
        )
        expect(screen.getByText('old')).toBeInTheDocument()

        const refreshed = [makeEntry(2, 'fresh'), makeEntry(1, 'old')]
        rerender(
            <ProjectTimeline
                projectId={1}
                initialEntries={refreshed}
                initialNextCursor={null}
                isOwner={false}
            />,
        )

        expect(screen.getByText('fresh')).toBeInTheDocument()
        expect(screen.getByText('old')).toBeInTheDocument()
    })

    it('renders empty state when no entries', () => {
        render(
            <ProjectTimeline
                projectId={1}
                initialEntries={[]}
                initialNextCursor={null}
                isOwner={false}
            />,
        )
        expect(
            screen.getByText(/Todavía no hay actividad en este proyecto/i),
        ).toBeInTheDocument()
    })
})
