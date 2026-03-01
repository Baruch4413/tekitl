'use client'

import { useState, useRef, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import ExperienceSlider from '@/components/ui/profile/ExperienceSlider'
import { store, update, destroy } from '@/actions/App/Http/Controllers/UserTalentController'

export interface Talent {
    id: number
    occupation: string
    confidenceLevel: string
    experienceYears: number
}

const confidenceLevels = [
    { value: 'aprendiz', label: 'Aprendiz', color: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20' },
    { value: 'autosuficiente', label: 'Autosuficiente', color: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20' },
    { value: 'maestro', label: 'Maestro', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20' },
]

const experienceLabels: Record<number, string> = {
    0: 'Menos de 1 año',
    1: 'Más de un año',
    3: 'Más de 3 años',
    5: 'Más de 5 años',
    10: 'Más de 10 años',
}

interface TalentosTabProps {
    talents: Talent[]
    occupations?: string[]
    isOwner: boolean
}

export default function TalentosTab({ talents, occupations, isOwner }: TalentosTabProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Talent | null>(null)
    const [occupation, setOccupation] = useState('')
    const [occupationQuery, setOccupationQuery] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [confidenceLevel, setConfidenceLevel] = useState('aprendiz')
    const [experienceYears, setExperienceYears] = useState(0)
    const [processing, setProcessing] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
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

    const openDialog = (talent?: Talent) => {
        if (talent) {
            setEditing(talent)
            setOccupation(talent.occupation)
            setOccupationQuery(talent.occupation)
            setConfidenceLevel(talent.confidenceLevel)
            setExperienceYears(talent.experienceYears)
        } else {
            setEditing(null)
            setOccupation('')
            setOccupationQuery('')
            setConfidenceLevel('aprendiz')
            setExperienceYears(0)
        }
        setShowSuggestions(false)
        setErrors({})
        setDialogOpen(true)

        if (!occupations) {
            router.reload({ only: ['occupations'] })
        }
    }

    const closeDialog = () => {
        setDialogOpen(false)
        setEditing(null)
    }

    const handleSubmit = () => {
        setProcessing(true)
        setErrors({})

        const data = {
            occupation,
            confidence_level: confidenceLevel,
            experience_years: experienceYears,
        }

        const options = {
            preserveScroll: true,
            only: ['talents'],
            onSuccess: () => closeDialog(),
            onError: (errs: Record<string, string>) => setErrors(errs),
            onFinish: () => setProcessing(false),
        }

        if (editing) {
            router.patch(update.url(editing.id), data, options)
        } else {
            router.post(store.url(), data, options)
        }
    }

    const handleDelete = (talent: Talent) => {
        router.delete(destroy.url(talent.id), { preserveScroll: true, only: ['talents'] })
    }

    const filteredOccupations = (occupations ?? []).filter(
        (o) => o.toLowerCase().includes(occupationQuery.toLowerCase()),
    )

    const selectOccupation = (occ: string) => {
        setOccupation(occ)
        setOccupationQuery(occ)
        setShowSuggestions(false)
    }

    return (
        <div className="px-4 py-6 sm:px-6 lg:px-8">
            {isOwner && (
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => openDialog()}
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                    >
                        <PlusIcon className="-ml-0.5 size-5" />
                        Agregar talento
                    </button>
                </div>
            )}

            {talents.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    {isOwner ? 'Agrega tus talentos para que otros los conozcan.' : 'Este usuario aún no ha agregado talentos.'}
                </div>
            )}

            {talents.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {talents.map((talent) => {
                        const level = confidenceLevels.find((l) => l.value === talent.confidenceLevel)
                        return (
                            <div
                                key={talent.id}
                                className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-white/5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                                            {talent.occupation}
                                        </h3>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {experienceLabels[talent.experienceYears] ?? ''}
                                        </p>
                                    </div>
                                    {isOwner && (
                                        <div className="flex shrink-0 gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openDialog(talent)}
                                                className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                            >
                                                <PencilSquareIcon className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(talent)}
                                                className="rounded p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {level && (
                                    <span className={`mt-3 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${level.color}`}>
                                        {level.label}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Editar talento' : 'Agregar talento'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Occupation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Ocupación
                            </label>
                            <div className="relative mt-1">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={occupationQuery}
                                    onChange={(e) => {
                                        setOccupationQuery(e.target.value)
                                        setOccupation(e.target.value)
                                        setShowSuggestions(true)
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Buscar ocupación..."
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                />
                                {showSuggestions && filteredOccupations.length > 0 && (
                                    <ul
                                        ref={suggestionsRef}
                                        className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10"
                                    >
                                        {filteredOccupations.map((occ) => (
                                            <li
                                                key={occ}
                                                onClick={() => selectOccupation(occ)}
                                                className="cursor-default px-3 py-2 text-gray-900 select-none hover:bg-indigo-600 hover:text-white dark:text-white dark:hover:bg-indigo-500"
                                            >
                                                {occ}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {errors.occupation && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.occupation}</p>
                                )}
                            </div>
                        </div>

                        {/* Confidence Level */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nivel de confianza
                            </label>
                            <div className="mt-2 flex gap-2">
                                {confidenceLevels.map((level) => (
                                    <button
                                        key={level.value}
                                        type="button"
                                        onClick={() => setConfidenceLevel(level.value)}
                                        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                                            confidenceLevel === level.value
                                                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {level.label}
                                    </button>
                                ))}
                            </div>
                            {errors.confidence_level && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confidence_level}</p>
                            )}
                        </div>

                        {/* Experience */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Experiencia
                            </label>
                            <div className="mt-3 px-2">
                                <ExperienceSlider value={experienceYears} onChange={setExperienceYears} />
                            </div>
                            {errors.experience_years && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.experience_years}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose
                            onClick={closeDialog}
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/10"
                        >
                            Cancelar
                        </DialogClose>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                        >
                            {processing ? 'Guardando...' : editing ? 'Guardar' : 'Agregar'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
