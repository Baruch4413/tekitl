import { usePage } from '@inertiajs/react'
import type { TranslationDictionary, TranslationsPayload } from '@/types/global'

export type Replacements = Record<string, string | number>

/**
 * Walk a nested translation dictionary by dotted path.
 * Returns the leaf string when found; otherwise returns the key string and
 * emits console.error in non-production builds so missing keys are noticed.
 */
export function resolve(
    dictionary: TranslationsPayload | TranslationDictionary,
    key: string,
    replacements?: Replacements,
): string {
    const segments = key.split('.')
    let cursor: string | TranslationDictionary | undefined = dictionary as
        | string
        | TranslationDictionary

    for (const segment of segments) {
        if (cursor === undefined || typeof cursor === 'string') {
            cursor = undefined
            break
        }
        cursor = cursor[segment]
    }

    if (typeof cursor !== 'string') {
        if (
            typeof process === 'undefined' ||
            process.env?.NODE_ENV !== 'production'
        ) {
            console.error(`[i18n] Missing translation key: "${key}"`)
        }
        return key
    }

    return replacements ? interpolate(cursor, replacements) : cursor
}

/**
 * Replace every :token in `value` with `String(replacements[token])`.
 * Unknown tokens are left intact (mirrors Laravel's translator).
 */
export function interpolate(value: string, replacements: Replacements): string {
    return value.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, (match, name: string) => {
        if (Object.prototype.hasOwnProperty.call(replacements, name)) {
            return String(replacements[name])
        }
        return match
    })
}

/**
 * Select a plural form from a pipe-delimited or interval-prefixed translation
 * value. Mirrors Laravel's trans_choice grammar:
 *   "singular|plural"
 *   "{0} ninguno|{1} uno|[2,*] :count items"
 */
export function chooseForm(
    value: string,
    count: number,
    replacements?: Replacements,
): string {
    const segments = value.split('|')

    let chosen: string | undefined

    for (const segment of segments) {
        const intervalMatch = segment.match(/^\s*(\{(\d+)\}|\[(\S+),(\S+)\])\s*(.*)$/s)
        if (intervalMatch) {
            const [, , exact, lower, upper, body] = intervalMatch
            if (exact !== undefined) {
                if (Number(exact) === count) {
                    chosen = body
                    break
                }
                continue
            }
            const lowerN = lower === '*' ? Number.NEGATIVE_INFINITY : Number(lower)
            const upperN = upper === '*' ? Number.POSITIVE_INFINITY : Number(upper)
            if (count >= lowerN && count <= upperN) {
                chosen = body
                break
            }
        }
    }

    if (chosen === undefined) {
        // Fall back to plain singular|plural selection on segments that have no
        // interval prefix.
        const plain = segments.filter((s) => !/^\s*(\{\d+\}|\[\S+,\S+\])/.test(s))
        if (plain.length === 1) {
            chosen = plain[0]
        } else if (plain.length >= 2) {
            chosen = count === 1 ? plain[0] : plain[1]
        } else {
            chosen = segments[segments.length - 1]
        }
    }

    chosen = chosen.trimStart()

    const merged: Replacements = { count, ...(replacements ?? {}) }
    return interpolate(chosen, merged)
}

function useShared(): { translations: TranslationsPayload; locale: string } {
    const props = usePage().props as unknown as {
        translations?: TranslationsPayload
        locale?: string
    }
    return {
        translations: props.translations ?? {},
        locale: props.locale ?? 'es',
    }
}

/**
 * Resolve a translation key for the active request locale.
 *
 * MUST be called from a React render path; it reads the shared Inertia
 * translation payload via `usePage()`. Behavior is documented in
 * specs/002-i18n-spanish-baseline/contracts/translation-helper.md.
 */
export function t(key: string, replacements?: Replacements): string {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- contract requires render-context invocation
    const { translations } = useShared()
    return resolve(translations, key, replacements)
}

/**
 * Resolve a count-aware translation key. Mirrors server-side `trans_choice`.
 * The value of `count` is automatically merged into the replacements map under
 * the `count` key, matching Laravel's behavior.
 *
 * Same render-context constraint as `t()`.
 */
export function tChoice(
    key: string,
    count: number,
    replacements?: Replacements,
): string {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- contract requires render-context invocation
    const { translations } = useShared()
    const value = resolve(translations, key)
    if (value === key) {
        // resolve already logged the miss; return as-is.
        return key
    }
    return chooseForm(value, count, replacements)
}

/** Active locale (e.g. "es"). Useful for Intl.* constructors. */
export function useLocale(): string {
    return useShared().locale
}
