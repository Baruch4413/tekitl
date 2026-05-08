import {
    BoltIcon,
    CameraIcon,
    CheckCircleIcon,
    FlagIcon,
    HandRaisedIcon,
    MegaphoneIcon,
    SparklesIcon,
    TrophyIcon,
    UserMinusIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline'
import { t } from '@/lib/i18n'

export type TimelineEventType =
    | 'role_created'
    | 'volunteer_joined'
    | 'volunteer_bailed'
    | 'volunteer_exhausted'
    | 'milestone'
    | 'status_update'
    | 'photo_uploaded'
    | 'coins_received'
    | 'stage_transition'

export interface TimelineActor {
    id: number
    name: string
    avatarUrl: string | null
}

export interface TimelineEntry {
    id: number
    type: TimelineEventType
    data: Record<string, unknown>
    createdAt: string
    createdAtRelative: string
    actor: TimelineActor | null
}

interface ProjectTimelineEntryProps {
    entry: TimelineEntry
}

const stageLabels: Record<string, string> = {
    planning: 'planificación',
    in_execution: 'en ejecución',
    completed: 'completado',
    aborted: 'abortado',
}

const bailReasonLabels: Record<string, string> = {
    owner_removed: 'fue removido del proyecto',
    auto_rejected_terminal_stage: 'fue rechazado automáticamente al cerrarse el proyecto',
}

const iconFor: Record<TimelineEventType, typeof SparklesIcon> = {
    role_created: SparklesIcon,
    volunteer_joined: UserPlusIcon,
    volunteer_bailed: UserMinusIcon,
    volunteer_exhausted: HandRaisedIcon,
    milestone: TrophyIcon,
    status_update: MegaphoneIcon,
    photo_uploaded: CameraIcon,
    coins_received: BoltIcon,
    stage_transition: FlagIcon,
}

const accentFor: Record<TimelineEventType, string> = {
    role_created: 'text-indigo-500',
    volunteer_joined: 'text-emerald-500',
    volunteer_bailed: 'text-rose-500',
    volunteer_exhausted: 'text-amber-500',
    milestone: 'text-yellow-500',
    status_update: 'text-sky-500',
    photo_uploaded: 'text-purple-500',
    coins_received: 'text-amber-500',
    stage_transition: 'text-gray-500',
}

function asString(value: unknown): string {
    return typeof value === 'string' ? value : String(value ?? '')
}

function asNumber(value: unknown): number {
    return typeof value === 'number' ? value : Number(value ?? 0)
}

function describe(entry: TimelineEntry): React.ReactNode {
    const data = entry.data
    const actorName = entry.actor?.name ?? 'Alguien'

    switch (entry.type) {
        case 'role_created':
            return (
                <span>
                    {actorName} creó el rol <strong>{asString(data.role_title)}</strong>.
                </span>
            )
        case 'volunteer_joined':
            return (
                <span>
                    <strong>{asString(data.volunteer_name)}</strong> se unió como{' '}
                    <strong>{asString(data.role_title)}</strong>.
                </span>
            )
        case 'volunteer_bailed': {
            const reason = bailReasonLabels[asString(data.reason)] ?? 'dejó el proyecto'
            return (
                <span>
                    <strong>{asString(data.volunteer_name)}</strong> {reason}.
                </span>
            )
        }
        case 'volunteer_exhausted':
            return (
                <span>
                    <strong>{asString(data.volunteer_name)}</strong> agotó sus horas comprometidas.
                </span>
            )
        case 'milestone':
            return (
                <span>
                    <strong>{t('projects.timeline_entry.milestone')}</strong> {asString(data.title)}
                </span>
            )
        case 'status_update':
            return (
                <span>
                    <strong>{t('projects.timeline_entry.status_update')}</strong> {asString(data.body)}
                </span>
            )
        case 'photo_uploaded':
            return <span>{actorName} subió una nueva foto.</span>
        case 'coins_received':
            return (
                <span>
                    El proyecto recibió <strong>{asNumber(data.coins)} monedas</strong> por reacciones.
                </span>
            )
        case 'stage_transition': {
            const from = stageLabels[asString(data.from)] ?? asString(data.from)
            const to = stageLabels[asString(data.to)] ?? asString(data.to)
            return (
                <span>
                    {actorName} cambió la etapa de <strong>{from}</strong> {t('projects.timeline_entry.stage_transition_separator')} <strong>{to}</strong>.
                </span>
            )
        }
    }
}

export default function ProjectTimelineEntry({ entry }: ProjectTimelineEntryProps) {
    const Icon = iconFor[entry.type] ?? CheckCircleIcon
    const accent = accentFor[entry.type] ?? 'text-gray-500'
    const isMilestone = entry.type === 'milestone'
    const isStatusUpdate = entry.type === 'status_update'
    const isHighlighted = isMilestone || isStatusUpdate

    const bubbleClass = isMilestone
        ? 'border border-yellow-300 bg-yellow-50 px-3 py-2 dark:border-yellow-500/30 dark:bg-yellow-500/10'
        : isStatusUpdate
          ? 'border border-sky-300 bg-sky-50 px-3 py-2 dark:border-sky-500/30 dark:bg-sky-500/10'
          : ''

    const iconBgClass = isMilestone
        ? 'bg-yellow-100 dark:bg-yellow-500/20'
        : isStatusUpdate
          ? 'bg-sky-100 dark:bg-sky-500/20'
          : 'bg-gray-100 dark:bg-white/10'

    return (
        <li className="relative flex gap-3 py-3">
            <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}
            >
                <Icon aria-hidden className={`size-4 ${accent}`} />
            </div>
            <div className={`flex-1 rounded-md ${bubbleClass}`}>
                <p
                    className={`text-sm text-gray-900 dark:text-gray-100 ${
                        isHighlighted ? 'font-medium' : ''
                    }`}
                >
                    {describe(entry)}
                </p>
                <p className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    {isHighlighted && entry.actor && <span>{entry.actor.name} ·</span>}
                    <span>{entry.createdAtRelative}</span>
                </p>
            </div>
        </li>
    )
}
