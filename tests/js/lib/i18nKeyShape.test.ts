import { describe, expect, it, vi } from 'vitest';

vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            locale: 'es',
            translations: {
                canary: {
                    greeting: 'Hola, :name.',
                },
            },
        },
    }),
}));

import { t } from '@/lib/i18n';

/**
 * US2 / FR-001 / FR-010.
 *
 * The audit is the source of truth for "non-literal key at the call site"
 * enforcement (it flags template literals and string concatenation). At
 * runtime, t() is permissive: it accepts any string and reports a miss.
 *
 * These tests pin the runtime contract from a synthetic call site that
 * constructs a key dynamically — the kind of site the audit would block at
 * commit time. The runtime behavior must remain: missing key returns the key
 * verbatim and emits console.error in non-production builds.
 */

describe('t() runtime shape with non-literal keys', () => {
    it('returns the key string and warns when a constructed key misses', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const dynamicSegment = 'unknown';
        const constructed = `canary.${dynamicSegment}`;

        expect(t(constructed)).toBe(constructed);
        expect(errSpy).toHaveBeenCalledTimes(1);
        expect(errSpy.mock.calls[0]?.[0]).toContain(constructed);

        errSpy.mockRestore();
    });

    it('still resolves when a constructed key happens to hit a leaf', () => {
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        const constructed = ['canary', 'greeting'].join('.');

        expect(t(constructed, { name: 'Ana' })).toBe('Hola, Ana.');
        expect(errSpy).not.toHaveBeenCalled();

        errSpy.mockRestore();
    });
});
