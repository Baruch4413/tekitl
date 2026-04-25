import { useState } from 'react'
import { router } from '@inertiajs/react'
import { PencilIcon, TrashIcon, PlusIcon, XMarkIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { UserGroupIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    store as storeRole,
    update as updateRole,
    destroy as destroyRole,
} from '@/actions/App/Http/Controllers/ProjectRoleController'
import {
    store as applyToRole,
    update as reviewVolunteer,
    destroy as removeVolunteer,
} from '@/actions/App/Http/Controllers/ProjectVolunteerController'

export interface Volunteer {
    id: number
    userId: number
    name: string
    avatarUrl: string | null
}

export interface ProjectRole {
    id: number
    title: string
    description: string | null
    slots: number
    hoursEstimated: number
    filledSlots: number
    volunteers: Volunteer[]
    pendingApplicants: Volunteer[]
}

interface CurrentUserApplication {
    id: number
    roleId: number
    status: 'pending' | 'active'
}

interface ProjectRolesProps {
    projectId: number
    roles: ProjectRole[]
    isOwner: boolean
    isAuthenticated: boolean
    currentUserApplication: CurrentUserApplication | null
}

interface RoleFormState {
    title: string
    description: string
    slots: string
    hoursEstimated: string
}

const emptyForm = (): RoleFormState => ({
    title: '',
    description: '',
    slots: '1',
    hoursEstimated: '10',
})

function RoleForm({
    initial,
    onSave,
    onCancel,
    processing,
}: {
    initial: RoleFormState
    onSave: (data: RoleFormState) => void
    onCancel: () => void
    processing: boolean
}) {
    const [form, setForm] = useState<RoleFormState>(initial)
    const set = (key: keyof RoleFormState, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }))

    return (
        <div className="space-y-2 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-500/20 dark:bg-indigo-500/5">
            <input
                type="text"
                placeholder="Título del rol *"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/30"
            />
            <textarea
                placeholder="Descripción (opcional)"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-white/30"
            />
            <div className="flex gap-x-2">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Plazas</label>
                    <input
                        type="number"
                        min={1}
                        max={500}
                        value={form.slots}
                        onChange={(e) => set('slots', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Horas estimadas</label>
                    <input
                        type="number"
                        min={1}
                        max={10000}
                        value={form.hoursEstimated}
                        onChange={(e) => set('hoursEstimated', e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                </div>
            </div>
            <div className="flex gap-x-2 pt-1">
                <Button size="sm" onClick={() => onSave(form)} disabled={processing || !form.title.trim()}>
                    <CheckIcon className="size-3.5" />
                    Guardar
                </Button>
                <Button size="sm" onClick={onCancel} disabled={processing}>
                    <XMarkIcon className="size-3.5" />
                    Cancelar
                </Button>
            </div>
        </div>
    )
}

function ApplicantReviewModal({
    open,
    applicant,
    roleName,
    projectId,
    onClose,
}: {
    open: boolean
    applicant: Volunteer | null
    roleName: string
    projectId: number
    onClose: () => void
}) {
    const [processing, setProcessing] = useState(false)

    const review = (status: 'active' | 'bailed') => {
        if (!applicant) return
        setProcessing(true)
        router.patch(
            reviewVolunteer.url({ project: projectId, volunteer: applicant.id }),
            { status },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onError: (errors) => Object.values(errors).forEach((msg) => toast.error(msg)),
                onFinish: () => setProcessing(false),
            },
        )
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Solicitud de voluntariado</DialogTitle>
                    <DialogDescription>
                        Revisión para el rol: <span className="font-medium text-gray-900 dark:text-white">{roleName}</span>
                    </DialogDescription>
                </DialogHeader>
                {applicant && (
                    <>
                        <div className="flex items-center gap-x-4 py-2">
                            {applicant.avatarUrl ? (
                                <img src={applicant.avatarUrl} alt="" className="size-12 rounded-full object-cover" />
                            ) : (
                                <div className="flex size-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                                    {applicant.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">{applicant.name}</p>
                                <p className="text-sm text-amber-600 dark:text-amber-400">Solicitud pendiente</p>
                            </div>
                        </div>
                        <div className="flex gap-x-3 pt-2">
                            <Button className="flex-1" onClick={() => review('active')} disabled={processing}>
                                <CheckIcon className="size-4" />
                                Aceptar
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600"
                                onClick={() => review('bailed')}
                                disabled={processing}
                            >
                                <XMarkIcon className="size-4" />
                                Rechazar
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default function ProjectRoles({
    projectId,
    roles,
    isOwner,
    isAuthenticated,
    currentUserApplication,
}: ProjectRolesProps) {
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [processing, setProcessing] = useState(false)
    const [reviewingApplicant, setReviewingApplicant] = useState<{ volunteer: Volunteer; role: ProjectRole } | null>(null)

    const handleStore = (data: RoleFormState) => {
        setProcessing(true)
        router.post(
            storeRole.url(projectId),
            {
                title: data.title,
                description: data.description || null,
                slots: parseInt(data.slots),
                hours_estimated: parseInt(data.hoursEstimated),
            },
            {
                preserveScroll: true,
                onSuccess: () => setAdding(false),
                onError: (errors) => Object.values(errors).forEach((msg) => toast.error(msg)),
                onFinish: () => setProcessing(false),
            },
        )
    }

    const handleUpdate = (role: ProjectRole, data: RoleFormState) => {
        setProcessing(true)
        router.patch(
            updateRole.url({ project: projectId, role: role.id }),
            {
                title: data.title,
                description: data.description || null,
                slots: parseInt(data.slots),
                hours_estimated: parseInt(data.hoursEstimated),
            },
            {
                preserveScroll: true,
                onSuccess: () => setEditingId(null),
                onError: (errors) => Object.values(errors).forEach((msg) => toast.error(msg)),
                onFinish: () => setProcessing(false),
            },
        )
    }

    const handleDestroy = (role: ProjectRole) => {
        router.delete(destroyRole.url({ project: projectId, role: role.id }), {
            preserveScroll: true,
            onError: (errors) => Object.values(errors).forEach((msg) => toast.error(msg)),
        })
    }

    const handleApply = (role: ProjectRole) => {
        if (!isAuthenticated) {
            window.dispatchEvent(new CustomEvent('login-required'))
            return
        }
        router.post(
            applyToRole.url({ project: projectId, role: role.id }),
            {},
            {
                preserveScroll: true,
                onError: (errors) => Object.values(errors).forEach((msg) => toast.error(msg)),
            },
        )
    }

    const handleWithdraw = () => {
        if (!currentUserApplication) return
        router.delete(
            removeVolunteer.url({ project: projectId, volunteer: currentUserApplication.id }),
            {
                preserveScroll: true,
                onError: (errors) => Object.values(errors).forEach((msg) => toast.error(msg)),
            },
        )
    }

    const canApply = isAuthenticated && !isOwner && !currentUserApplication

    return (
        <>
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-2">
                        <UserGroupIcon className="size-5 text-gray-500 dark:text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Roles buscados</h3>
                    </div>
                    {isOwner && !adding && (
                        <button
                            onClick={() => setAdding(true)}
                            className="flex items-center gap-x-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                            <PlusIcon className="size-4" />
                            Añadir rol
                        </button>
                    )}
                </div>

                {roles.length === 0 && !adding && (
                    <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
                        {isOwner ? 'Añade los roles que necesitas para este proyecto.' : 'Este proyecto aún no ha definido roles.'}
                    </p>
                )}

                {roles.length > 0 && (
                    <ul className="mt-3 space-y-2">
                        {roles.map((role) =>
                            editingId === role.id ? (
                                <li key={role.id}>
                                    <RoleForm
                                        initial={{
                                            title: role.title,
                                            description: role.description ?? '',
                                            slots: role.slots.toString(),
                                            hoursEstimated: role.hoursEstimated.toString(),
                                        }}
                                        onSave={(data) => handleUpdate(role, data)}
                                        onCancel={() => setEditingId(null)}
                                        processing={processing}
                                    />
                                </li>
                            ) : (
                                <li
                                    key={role.id}
                                    className={`rounded-lg border bg-white px-3 py-2.5 dark:bg-white/5 ${currentUserApplication?.roleId === role.id && currentUserApplication.status === 'pending' ? 'border-amber-400 dark:border-amber-500/60' : 'border-gray-200 dark:border-white/10'}`}
                                >
                                    <div className="flex items-start justify-between gap-x-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{role.title}</p>
                                            {role.description && (
                                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                                            )}
                                            <div className="mt-1 flex items-center gap-x-3 text-xs text-gray-500 dark:text-gray-400">
                                                <span>
                                                    <span className={role.filledSlots >= role.slots ? 'font-semibold text-green-600 dark:text-green-400' : 'font-semibold text-gray-700 dark:text-gray-300'}>
                                                        {role.filledSlots}/{role.slots}
                                                    </span>{' '}
                                                    plazas
                                                </span>
                                                <span>·</span>
                                                <span>~{role.hoursEstimated}h</span>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center self-center gap-x-1">
                                            {/* Owner controls */}
                                            {isOwner && (
                                                <>
                                                    <button
                                                        onClick={() => setEditingId(role.id)}
                                                        className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                    >
                                                        <PencilIcon className="size-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDestroy(role)}
                                                        className="rounded p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                                    >
                                                        <TrashIcon className="size-3.5" />
                                                    </button>
                                                </>
                                            )}

                                            {/* Apply button */}
                                            {canApply && role.filledSlots < role.slots && (
                                                <Button size="sm" onClick={() => handleApply(role)}>
                                                    Postularme
                                                </Button>
                                            )}

                                            {/* Current user applied to this role */}
                                            {currentUserApplication?.roleId === role.id && currentUserApplication.status === 'pending' && (
                                                <Button size="sm" variant="destructive" onClick={handleWithdraw}>
                                                    Cancelar solicitud
                                                </Button>
                                            )}

                                            {currentUserApplication?.roleId === role.id && currentUserApplication.status === 'active' && (
                                                <span className="text-xs font-medium text-green-600 dark:text-green-400">Miembro ✓</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pending applicants — owner only */}
                                    {isOwner && role.pendingApplicants.length > 0 && (
                                        <div className="mt-2 space-y-1 border-t border-amber-100 pt-2 dark:border-amber-500/10">
                                            {role.pendingApplicants.map((applicant) => (
                                                <button
                                                    key={applicant.id}
                                                    onClick={() => setReviewingApplicant({ volunteer: applicant, role })}
                                                    className="flex w-full items-center gap-x-2 rounded-lg px-2 py-1 text-left hover:bg-amber-50 dark:hover:bg-amber-500/5"
                                                >
                                                    <ExclamationTriangleIcon className="size-4 shrink-0 text-amber-500" />
                                                    {applicant.avatarUrl ? (
                                                        <img src={applicant.avatarUrl} alt="" className="size-5 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="flex size-5 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold dark:bg-white/10">
                                                            {applicant.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-xs text-gray-700 dark:text-gray-300">{applicant.name}</span>
                                                    <span className="text-xs text-amber-600 dark:text-amber-400">— pendiente de aprobación</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </li>
                            ),
                        )}
                    </ul>
                )}

                {adding && (
                    <div className="mt-3">
                        <RoleForm
                            initial={emptyForm()}
                            onSave={handleStore}
                            onCancel={() => setAdding(false)}
                            processing={processing}
                        />
                    </div>
                )}
            </div>

            <ApplicantReviewModal
                open={reviewingApplicant !== null}
                applicant={reviewingApplicant?.volunteer ?? null}
                roleName={reviewingApplicant?.role.title ?? ''}
                projectId={projectId}
                onClose={() => setReviewingApplicant(null)}
            />
        </>
    )
}
