'use client'

import { useEffect, useRef, useCallback } from 'react'

interface PlaceResult {
    name: string
    placeId: string
    lat: number
    lng: number
}

interface GooglePlacesAutocompleteProps {
    apiKey: string | null
    value: string
    onChange: (value: string) => void
    onPlaceSelect: (place: PlaceResult) => void
    placeholder?: string
}

declare global {
    interface Window {
        google?: {
            maps: {
                places: {
                    Autocomplete: new (
                        input: HTMLInputElement,
                        options?: Record<string, unknown>,
                    ) => {
                        addListener: (event: string, callback: () => void) => void
                        getPlace: () => {
                            formatted_address?: string
                            place_id?: string
                            geometry?: { location: { lat: () => number; lng: () => number } }
                        }
                    }
                }
            }
        }
    }
}

let scriptLoaded = false
let scriptLoading = false

function loadScript(apiKey: string): Promise<void> {
    if (scriptLoaded) {
        return Promise.resolve()
    }

    if (scriptLoading) {
        return new Promise((resolve) => {
            const check = setInterval(() => {
                if (scriptLoaded) {
                    clearInterval(check)
                    resolve()
                }
            }, 100)
        })
    }

    scriptLoading = true

    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.onload = () => {
            scriptLoaded = true
            scriptLoading = false
            resolve()
        }
        script.onerror = () => {
            scriptLoading = false
            reject(new Error('Failed to load Google Maps'))
        }
        document.head.appendChild(script)
    })
}

export default function GooglePlacesAutocomplete({
    apiKey,
    value,
    onChange,
    onPlaceSelect,
    placeholder = 'Buscar ubicación...',
}: GooglePlacesAutocompleteProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const autocompleteRef = useRef<ReturnType<typeof window.google.maps.places.Autocomplete> | null>(null)

    const initAutocomplete = useCallback(async () => {
        if (!apiKey || !inputRef.current || autocompleteRef.current) {
            return
        }

        try {
            await loadScript(apiKey)

            if (!window.google || !inputRef.current) {
                return
            }

            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['(regions)'],
            })

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace()
                if (place.geometry && place.place_id) {
                    onPlaceSelect({
                        name: place.formatted_address ?? '',
                        placeId: place.place_id,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    })
                }
            })

            autocompleteRef.current = autocomplete
        } catch {
            // Google Maps failed to load — input still works as plain text
        }
    }, [apiKey, onPlaceSelect])

    useEffect(() => {
        initAutocomplete()
    }, [initAutocomplete])

    if (!apiKey) {
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
            />
        )
    }

    return (
        <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
        />
    )
}
