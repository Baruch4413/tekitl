import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            locale: 'es',
            translations: {
                accessibility: {
                    spinner: { loading: 'Cargando' },
                },
            },
        },
    }),
}))

import { Spinner } from '@/components/ui/spinner'

describe('a11y labels resolve via the i18n helper', () => {
    it('Spinner exposes a translated aria-label', () => {
        const { getByRole } = render(<Spinner />)
        const status = getByRole('status')
        expect(status).toHaveAttribute('aria-label', 'Cargando')
    })
})
