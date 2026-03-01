'use client'

import { useState, useRef, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/20/solid'

const commonLanguages = [
    'Español', 'Inglés', 'Francés', 'Portugués', 'Alemán', 'Italiano',
    'Chino mandarín', 'Japonés', 'Coreano', 'Árabe', 'Ruso', 'Hindi',
    'Náhuatl', 'Maya', 'Zapoteco', 'Mixteco', 'Catalán', 'Holandés',
    'Sueco', 'Polaco',
]

interface LanguageTagInputProps {
    value: string[]
    onChange: (languages: string[]) => void
}

export default function LanguageTagInput({ value, onChange }: LanguageTagInputProps) {
    const [query, setQuery] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const suggestionsRef = useRef<HTMLUListElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
                inputRef.current && !inputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const suggestions = commonLanguages.filter(
        (lang) => !value.includes(lang) && lang.toLowerCase().includes(query.toLowerCase()),
    )

    const addLanguage = (lang: string) => {
        if (lang && !value.includes(lang) && value.length < 10) {
            onChange([...value, lang])
            setQuery('')
            setShowSuggestions(false)
        }
    }

    const removeLanguage = (lang: string) => {
        onChange(value.filter((l) => l !== lang))
    }

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((lang) => (
                        <span
                            key={lang}
                            className="inline-flex items-center gap-x-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:ring-indigo-400/20"
                        >
                            {lang}
                            <button
                                type="button"
                                onClick={() => removeLanguage(lang)}
                                className="-mr-0.5 inline-flex size-4 items-center justify-center rounded-sm text-indigo-600 hover:bg-indigo-200 hover:text-indigo-900 dark:text-indigo-400 dark:hover:bg-indigo-400/20 dark:hover:text-indigo-300"
                            >
                                <XMarkIcon className="size-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {value.length < 10 && (
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setShowSuggestions(true)
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Agregar idioma..."
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <ul
                            ref={suggestionsRef}
                            className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
                        >
                            {suggestions.map((lang) => (
                                <li
                                    key={lang}
                                    onClick={() => addLanguage(lang)}
                                    className="cursor-default px-3 py-2 text-gray-900 select-none hover:bg-indigo-600 hover:text-white dark:text-white dark:hover:bg-indigo-500"
                                >
                                    {lang}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
