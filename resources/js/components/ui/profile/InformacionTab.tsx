'use client'

import { useState } from 'react'
import { router } from '@inertiajs/react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { toast } from 'sonner'
import BiographyIcon from '@/components/vector-graphics/BiographyIcon'
import LocationIcon from '@/components/vector-graphics/LocationIcon'
import BirthDate from '@/components/vector-graphics/BirthDate'
import ContactPhone from '@/components/vector-graphics/ContactPhone'
import ContactEmail from '@/components/vector-graphics/ContactEmail'
import UserLanguages from '@/components/vector-graphics/UserLanguages'
import GooglePlacesAutocomplete from '@/components/ui/profile/GooglePlacesAutocomplete'
import LanguageTagInput from '@/components/ui/profile/LanguageTagInput'
import { update } from '@/actions/App/Http/Controllers/UserProfileInfoController'

interface ProfileInfo {
    bio: string | null
    locationName: string | null
    locationPlaceId: string | null
    locationLat: number | null
    locationLng: number | null
    birthdate: string | null
    publicPhone: string | null
    contactEmail: string | null
    languages: string[] | null
}

interface InformacionTabProps {
    profileInfo: ProfileInfo
    isOwner: boolean
    googleMapsApiKey: string | null
}

type EditingField = 'bio' | 'location' | 'birthdate' | 'publicPhone' | 'contactEmail' | 'languages' | null

const placeholder = 'No hay información para mostrar'

const inputClass = 'block w-full rounded-md bg-white px-3 py-2 text-sm text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500'

export default function InformacionTab({ profileInfo, isOwner, googleMapsApiKey }: InformacionTabProps) {
    const [editingField, setEditingField] = useState<EditingField>(null)
    const [processing, setProcessing] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [bio, setBio] = useState(profileInfo.bio ?? '')
    const [locationName, setLocationName] = useState(profileInfo.locationName ?? '')
    const [locationPlaceId, setLocationPlaceId] = useState(profileInfo.locationPlaceId ?? '')
    const [locationLat, setLocationLat] = useState(profileInfo.locationLat)
    const [locationLng, setLocationLng] = useState(profileInfo.locationLng)
    const [birthdate, setBirthdate] = useState(profileInfo.birthdate ?? '')
    const [publicPhone, setPublicPhone] = useState(profileInfo.publicPhone ?? '')
    const [contactEmail, setContactEmail] = useState(profileInfo.contactEmail ?? '')
    const [languages, setLanguages] = useState<string[]>(profileInfo.languages ?? [])

    const saveField = (field: EditingField) => {
        setProcessing(true)
        setErrors({})

        const data: Record<string, unknown> = {}

        switch (field) {
            case 'bio':
                data.bio = bio || null
                break
            case 'location':
                data.location_name = locationName || null
                data.location_place_id = locationPlaceId || null
                data.location_lat = locationLat
                data.location_lng = locationLng
                break
            case 'birthdate':
                data.birthdate = birthdate || null
                break
            case 'publicPhone':
                data.public_phone = publicPhone || null
                break
            case 'contactEmail':
                data.contact_email = contactEmail || null
                break
            case 'languages':
                data.languages = languages.length > 0 ? languages : null
                break
        }

        router.patch(update.url(), data, {
            preserveScroll: true,
            only: ['profileUser'],
            onSuccess: () => setEditingField(null),
            onError: (errs: Record<string, string>) => {
                setErrors(errs)
                Object.values(errs).forEach((msg) => toast.error(msg))
            },
            onFinish: () => setProcessing(false),
        })
    }

    const cancelField = (field: EditingField) => {
        switch (field) {
            case 'bio':
                setBio(profileInfo.bio ?? '')
                break
            case 'location':
                setLocationName(profileInfo.locationName ?? '')
                setLocationPlaceId(profileInfo.locationPlaceId ?? '')
                setLocationLat(profileInfo.locationLat)
                setLocationLng(profileInfo.locationLng)
                break
            case 'birthdate':
                setBirthdate(profileInfo.birthdate ?? '')
                break
            case 'publicPhone':
                setPublicPhone(profileInfo.publicPhone ?? '')
                break
            case 'contactEmail':
                setContactEmail(profileInfo.contactEmail ?? '')
                break
            case 'languages':
                setLanguages(profileInfo.languages ?? [])
                break
        }
        setErrors({})
        setEditingField(null)
    }

    const editButton = (field: EditingField) => (
        isOwner && editingField !== field && (
            <button
                type="button"
                onClick={() => setEditingField(field)}
                className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:ring-white/[0.06] dark:hover:bg-white/10"
            >
                Editar
            </button>
        )
    )

    const saveCancel = (field: EditingField) => (
        <div className="mt-3 flex gap-2">
            <button
                type="button"
                onClick={() => saveField(field)}
                disabled={processing}
                className="inline-flex items-center gap-x-1 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50"
            >
                <CheckIcon className="size-3.5" />
                Guardar
            </button>
            <button
                type="button"
                onClick={() => cancelField(field)}
                className="inline-flex items-center gap-x-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:ring-white/[0.06] dark:hover:bg-white/10"
            >
                <XMarkIcon className="size-3.5" />
                Cancelar
            </button>
        </div>
    )

    const displayValue = (value: string | null, fallback: string) => (
        value ? <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span> : <span className="text-sm italic text-gray-400 dark:text-gray-500">{fallback}</span>
    )

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-3xl rounded-2xl border border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
                <dl className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                    {/* Bio */}
                    <div className="px-6 py-5">
                        {editingField === 'bio' ? (
                            <div>
                                <dt className="text-sm font-semibold text-gray-900 dark:text-white">Bio</dt>
                                <div className="mt-2">
                                    <textarea
                                        rows={3}
                                        maxLength={500}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Cuéntanos sobre ti..."
                                        className={inputClass}
                                        autoFocus
                                    />
                                    <div className="mt-1 flex justify-between">
                                        {errors.bio && <p className="text-xs text-red-600 dark:text-red-400">{errors.bio}</p>}
                                        <p className="ml-auto text-xs text-gray-400 dark:text-gray-500">{bio.length}/500</p>
                                    </div>
                                    {saveCancel('bio')}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex flex-row">
                                    <BiographyIcon/>
                                    <div className="flex flex-col ml-2">
                                        <dt className="text-sm font-semibold text-gray-900 dark:text-white">Bio</dt>
                                        <dd className={`mt-1 whitespace-pre-line text-sm ${profileInfo.bio ? 'text-gray-600 dark:text-gray-400' : 'italic text-gray-400 dark:text-gray-500'}`}>
                                            {profileInfo.bio || placeholder}
                                        </dd>
                                    </div>
                                </div>
                                <div className="shrink-0">{editButton('bio')}</div>
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div className="px-6 py-5">
                        {editingField === 'location' ? (
                            <div>
                                <dt className="text-sm font-semibold text-gray-900 dark:text-white">Ubicación</dt>
                                <div className="mt-2">
                                    <GooglePlacesAutocomplete
                                        apiKey={googleMapsApiKey}
                                        value={locationName}
                                        onChange={setLocationName}
                                        onPlaceSelect={(place) => {
                                            setLocationName(place.name)
                                            setLocationPlaceId(place.placeId)
                                            setLocationLat(place.lat)
                                            setLocationLng(place.lng)
                                        }}
                                    />
                                    {errors.location_name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.location_name}</p>}
                                    {saveCancel('location')}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex flex-row">
                                    <LocationIcon/>
                                    <div className="flex flex-col ml-2">
                                        <dt className="text-sm font-semibold text-gray-900 dark:text-white">Ubicación</dt>
                                        <dd className="mt-1">
                                            {displayValue(profileInfo.locationName, placeholder)}
                                        </dd>
                                    </div>
                                </div>
                                <div className="shrink-0">{editButton('location')}</div>
                            </div>
                        )}
                    </div>

                    {/* Birthdate */}
                    <div className="px-6 py-5">
                        {editingField === 'birthdate' ? (
                            <div>
                                <dt className="text-sm font-semibold text-gray-900 dark:text-white">Fecha de nacimiento</dt>
                                <div className="mt-2">
                                    <input
                                        type="date"
                                        value={birthdate}
                                        onChange={(e) => setBirthdate(e.target.value)}
                                        className={inputClass}
                                        autoFocus
                                    />
                                    {errors.birthdate && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.birthdate}</p>}
                                    {saveCancel('birthdate')}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex flex-row">
                                    <BirthDate/>
                                    <div className="flex flex-col ml-2">
                                        <dt className="text-sm font-semibold text-gray-900 dark:text-white">Fecha de nacimiento</dt>
                                        <dd className="mt-1">
                                            {displayValue(profileInfo.birthdate, placeholder)}
                                        </dd>
                                    </div>
                                </div>
                                <div className="shrink-0">{editButton('birthdate')}</div>
                            </div>
                        )}
                    </div>

                    {/* Public Phone */}
                    <div className="px-6 py-5">
                        {editingField === 'publicPhone' ? (
                            <div>
                                <dt className="text-sm font-semibold text-gray-900 dark:text-white">Teléfono público</dt>
                                <div className="mt-2">
                                    <input
                                        type="tel"
                                        value={publicPhone}
                                        onChange={(e) => setPublicPhone(e.target.value)}
                                        placeholder="+52 33 1234 5678"
                                        className={inputClass}
                                        autoFocus
                                    />
                                    {errors.public_phone && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.public_phone}</p>}
                                    {saveCancel('publicPhone')}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex flex-row">
                                    <ContactPhone/>
                                    <div className="flex flex-col ml-2">
                                        <dt className="text-sm font-semibold text-gray-900 dark:text-white">Teléfono público</dt>
                                        <dd className="mt-1">
                                            {displayValue(profileInfo.publicPhone, placeholder)}
                                        </dd>
                                    </div>
                                </div>
                                <div className="shrink-0">{editButton('publicPhone')}</div>
                            </div>
                        )}
                    </div>

                    {/* Contact Email */}
                    <div className="px-6 py-5">
                        {editingField === 'contactEmail' ? (
                            <div>
                                <dt className="text-sm font-semibold text-gray-900 dark:text-white">Email de contacto</dt>
                                <div className="mt-2">
                                    <input
                                        type="email"
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                        placeholder="contacto@ejemplo.com"
                                        className={inputClass}
                                        autoFocus
                                    />
                                    {errors.contact_email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.contact_email}</p>}
                                    {saveCancel('contactEmail')}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex flex-row">
                                    <ContactEmail/>
                                    <div className="flex flex-col ml-2">
                                        <dt className="text-sm font-semibold text-gray-900 dark:text-white">Email de contacto</dt>
                                        <dd className="mt-1">
                                            {displayValue(profileInfo.contactEmail, placeholder)}
                                        </dd>
                                    </div>
                                </div>
                                <div className="shrink-0">{editButton('contactEmail')}</div>
                            </div>
                        )}
                    </div>

                    {/* Languages */}
                    <div className="px-6 py-5">
                        {editingField === 'languages' ? (
                            <div>
                                <dt className="text-sm font-semibold text-gray-900 dark:text-white">Idiomas</dt>
                                <div className="mt-2">
                                    <LanguageTagInput value={languages} onChange={setLanguages} />
                                    {errors.languages && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.languages}</p>}
                                    {saveCancel('languages')}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex flex-row">
                                    <UserLanguages/>
                                    <div className="flex flex-col ml-2">
                                        <dt className="text-sm font-semibold text-gray-900 dark:text-white">Idiomas</dt>
                                        {profileInfo.languages && profileInfo.languages.length > 0 ? (
                                            <dd className="mt-2 flex flex-wrap gap-1.5">
                                                {profileInfo.languages.map((lang) => (
                                                    <span
                                                        key={lang}
                                                        className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-200 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
                                                    >
                                                        {lang}
                                                    </span>
                                                ))}
                                            </dd>
                                        ) : (
                                            <dd className="mt-1 text-sm italic text-gray-400 dark:text-gray-500">{placeholder}</dd>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0">{editButton('languages')}</div>
                            </div>
                        )}
                    </div>
                </dl>
            </div>
        </div>
    )
}
