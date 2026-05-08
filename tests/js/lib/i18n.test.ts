import { describe, expect, it, vi } from 'vitest'
import {
    chooseForm,
    interpolate,
    resolve,
} from '@/lib/i18n'

describe('i18n.resolve', () => {
    const dict = {
        canary: {
            greeting: 'Hola, :name.',
            nested: {
                deep: 'profundo',
            },
        },
    }

    it('walks dotted paths to reach a leaf', () => {
        expect(resolve(dict, 'canary.greeting')).toBe('Hola, :name.')
        expect(resolve(dict, 'canary.nested.deep')).toBe('profundo')
    })

    it('returns the key string when the path misses', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        expect(resolve(dict, 'canary.does.not.exist')).toBe('canary.does.not.exist')
        expect(errSpy).toHaveBeenCalled()
        errSpy.mockRestore()
    })

    it('interpolates :placeholder tokens', () => {
        expect(resolve(dict, 'canary.greeting', { name: 'Ana' })).toBe('Hola, Ana.')
    })
})

describe('i18n.interpolate', () => {
    it('replaces every :token with the matching value', () => {
        expect(interpolate('Hola, :name. Tienes :n mensajes.', { name: 'Ana', n: 3 })).toBe(
            'Hola, Ana. Tienes 3 mensajes.',
        )
    })

    it('leaves unknown tokens untouched', () => {
        expect(interpolate('Hola, :name.', {})).toBe('Hola, :name.')
    })
})

describe('i18n.chooseForm', () => {
    it('selects singular vs plural via pipe', () => {
        expect(chooseForm('Un voluntario|:count voluntarios', 1)).toBe('Un voluntario')
        expect(chooseForm('Un voluntario|:count voluntarios', 5, { count: 5 })).toBe(
            '5 voluntarios',
        )
    })

    it('honors interval prefixes', () => {
        const value = '{0} sin voluntarios|{1} un voluntario|[2,*] :count voluntarios'
        expect(chooseForm(value, 0)).toBe('sin voluntarios')
        expect(chooseForm(value, 1)).toBe('un voluntario')
        expect(chooseForm(value, 4, { count: 4 })).toBe('4 voluntarios')
    })
})
