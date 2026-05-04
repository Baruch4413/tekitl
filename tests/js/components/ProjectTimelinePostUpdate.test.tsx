import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProjectTimelinePostUpdate from '@/components/ui/proyectos/ProjectTimelinePostUpdate'

type FormState<T> = {
    data: T
    setData: (key: keyof T, value: string) => void
    post: (url: string, options?: { onSuccess?: () => void }) => void
    reset: () => void
    processing: boolean
    errors: Partial<Record<keyof T, string>>
}

const createFormStub = <T extends Record<string, string>>(initial: T): FormState<T> => {
    const state: FormState<T> = {
        data: { ...initial },
        setData: (key, value) => {
            state.data = { ...state.data, [key]: value }
        },
        post: vi.fn((_url, options) => {
            options?.onSuccess?.()
        }),
        reset: vi.fn(() => {
            state.data = { ...initial }
        }),
        processing: false,
        errors: {},
    }
    return state
}

const milestoneStub = createFormStub({ title: '' })
const statusStub = createFormStub({ body: '' })

vi.mock('@inertiajs/react', () => ({
    useForm: vi.fn((initial: Record<string, string>) => {
        if ('title' in initial) {
            return milestoneStub
        }
        return statusStub
    }),
}))

vi.mock('@/actions/App/Http/Controllers/ProjectTimelineController', () => ({
    storeMilestone: { url: (id: number) => `/proyectos/${id}/timeline/milestones` },
    storeStatusUpdate: { url: (id: number) => `/proyectos/${id}/timeline/status-updates` },
}))

describe('ProjectTimelinePostUpdate', () => {
    beforeEach(() => {
        milestoneStub.data = { title: '' }
        statusStub.data = { body: '' }
        milestoneStub.errors = {}
        statusStub.errors = {}
        vi.clearAllMocks()
    })

    it('updates milestone counter as user types', () => {
        const { rerender } = render(<ProjectTimelinePostUpdate projectId={1} />)
        const input = screen.getByPlaceholderText(/¿Qué hito alcanzaron\?/i) as HTMLInputElement

        fireEvent.change(input, { target: { value: 'shipped MVP' } })
        rerender(<ProjectTimelinePostUpdate projectId={1} />)

        expect(screen.getByText('11/120')).toBeInTheDocument()
    })

    it('resets milestone form on successful submit', () => {
        const onSuccess = vi.fn()
        render(<ProjectTimelinePostUpdate projectId={1} onSuccess={onSuccess} />)

        milestoneStub.data = { title: 'milestone reached' }
        const form = screen.getByRole('button', { name: /Publicar/i }).closest('form')!
        fireEvent.submit(form)

        expect(milestoneStub.post).toHaveBeenCalledWith(
            '/proyectos/1/timeline/milestones',
            expect.objectContaining({ preserveScroll: true }),
        )
        expect(milestoneStub.reset).toHaveBeenCalled()
        expect(onSuccess).toHaveBeenCalled()
    })

    it('switches to status tab and resets status form on submit', () => {
        const onSuccess = vi.fn()
        render(<ProjectTimelinePostUpdate projectId={1} onSuccess={onSuccess} />)

        fireEvent.click(screen.getByRole('button', { name: 'Actualización' }))

        statusStub.data = { body: 'progress note' }
        const form = screen.getByRole('button', { name: /Publicar/i }).closest('form')!
        fireEvent.submit(form)

        expect(statusStub.post).toHaveBeenCalledWith(
            '/proyectos/1/timeline/status-updates',
            expect.objectContaining({ preserveScroll: true }),
        )
        expect(statusStub.reset).toHaveBeenCalled()
        expect(onSuccess).toHaveBeenCalled()
    })

    it('renders validation errors from useForm', () => {
        milestoneStub.errors = { title: 'El título es obligatorio.' }
        render(<ProjectTimelinePostUpdate projectId={1} />)

        expect(screen.getByText('El título es obligatorio.')).toBeInTheDocument()
    })
})
