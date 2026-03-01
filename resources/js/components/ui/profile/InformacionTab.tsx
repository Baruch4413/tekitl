'use client'

import { useState } from 'react'
import { router } from '@inertiajs/react'
import { MapPinIcon, PhoneIcon, EnvelopeIcon, CalendarIcon, LanguageIcon, PencilSquareIcon, CheckIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'
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

const inputClass = 'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500'

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
            onError: (errs: Record<string, string>) => setErrors(errs),
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
                className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
                <PencilSquareIcon className="size-4" />
            </button>
        )
    )

    const saveCancel = (field: EditingField) => (
        <div className="mt-2 flex gap-2">
            <button
                type="button"
                onClick={() => saveField(field)}
                disabled={processing}
                className="inline-flex items-center gap-x-1 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
                <CheckIcon className="size-3.5" />
                Guardar
            </button>
            <button
                type="button"
                onClick={() => cancelField(field)}
                className="inline-flex items-center gap-x-1 rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/10"
            >
                <XMarkIcon className="size-3.5" />
                Cancelar
            </button>
        </div>
    )

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            <dl className="max-w-xl space-y-5">
                {/* Bio */}
                <div>
                    <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <ChatBubbleBottomCenterTextIcon className="size-4 shrink-0" />
                            Bio
                        </dt>
                        {editButton('bio')}
                    </div>
                    {editingField === 'bio' ? (
                        <div className="mt-1">
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
                                <p className="ml-auto text-xs text-gray-400">{bio.length}/500</p>
                            </div>
                            {saveCancel('bio')}
                        </div>
                    ) : (
                        <dd className={`mt-1 whitespace-pre-line text-sm ${profileInfo.bio ? 'text-gray-900 dark:text-white' : 'italic text-gray-400 dark:text-gray-500'}`}>
                            {profileInfo.bio || placeholder}
                        </dd>
                    )}
                </div>

                {/* Location */}
                <div>
                    <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <MapPinIcon className="size-4 shrink-0" />
                            Ubicación
                        </dt>
                        {editButton('location')}
                    </div>
                    {editingField === 'location' ? (
                        <div className="mt-1">
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
                    ) : (
                        <dd className={`mt-1 text-sm ${profileInfo.locationName ? 'text-gray-900 dark:text-white' : 'italic text-gray-400 dark:text-gray-500'}`}>
                            {profileInfo.locationName || placeholder}
                        </dd>
                    )}
                </div>

                {/* Birthdate */}
                <div>
                    <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="size-4 shrink-0" />
                            Fecha de nacimiento
                        </dt>
                        {editButton('birthdate')}
                    </div>
                    {editingField === 'birthdate' ? (
                        <div className="mt-1">
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
                    ) : (
                        <dd className={`mt-1 text-sm ${profileInfo.birthdate ? 'text-gray-900 dark:text-white' : 'italic text-gray-400 dark:text-gray-500'}`}>
                            {profileInfo.birthdate || placeholder}
                        </dd>
                    )}
                </div>

                {/* Public Phone */}
                <div>
                    <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <PhoneIcon className="size-4 shrink-0" />
                            Teléfono público
                        </dt>
                        {editButton('publicPhone')}
                    </div>
                    {editingField === 'publicPhone' ? (
                        <div className="mt-1">
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
                    ) : (
                        <dd className={`mt-1 text-sm ${profileInfo.publicPhone ? 'text-gray-900 dark:text-white' : 'italic text-gray-400 dark:text-gray-500'}`}>
                            {profileInfo.publicPhone || placeholder}
                        </dd>
                    )}
                </div>

                {/* Contact Email */}
                <div>
                    <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <EnvelopeIcon className="size-4 shrink-0" />
                            Email de contacto
                        </dt>
                        {editButton('contactEmail')}
                    </div>
                    {editingField === 'contactEmail' ? (
                        <div className="mt-1">
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
                    ) : (
                        <dd className={`mt-1 text-sm ${profileInfo.contactEmail ? 'text-gray-900 dark:text-white' : 'italic text-gray-400 dark:text-gray-500'}`}>
                            {profileInfo.contactEmail || placeholder}
                        </dd>
                    )}
                </div>

                {/* Languages */}
                <div>
                    <div className="flex items-center justify-between">
                        <dt className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <LanguageIcon className="size-4 shrink-0" />
                            Idiomas
                        </dt>
                        {editButton('languages')}
                    </div>
                    {editingField === 'languages' ? (
                        <div className="mt-1">
                            <LanguageTagInput value={languages} onChange={setLanguages} />
                            {errors.languages && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.languages}</p>}
                            {saveCancel('languages')}
                        </div>
                    ) : profileInfo.languages && profileInfo.languages.length > 0 ? (
                        <dd className="mt-1.5 flex flex-wrap gap-1.5">
                            {profileInfo.languages.map((lang) => (
                                <span
                                    key={lang}
                                    className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
                                >
                                    {lang}
                                </span>
                            ))}
                        </dd>
                    ) : (
                        <dd className="mt-1 text-sm italic text-gray-400 dark:text-gray-500">{placeholder}</dd>
                    )}
                </div>
            </dl>
        </div>
    )
}
