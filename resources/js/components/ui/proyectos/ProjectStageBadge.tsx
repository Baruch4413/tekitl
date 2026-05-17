import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export type ProjectStageValue = 'planning' | 'in_execution' | 'completed' | 'aborted'

interface ProjectStageBadgeProps {
    stage: ProjectStageValue
    stageLabel: string
    className?: string
}

const stageStyles: Record<ProjectStageValue, string> = {
    planning: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-white/5 dark:text-gray-300 dark:ring-white/10',
    in_execution: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/30',
    completed: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/30',
    aborted: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/30',
}

export default function ProjectStageBadge({ stage, stageLabel, className }: ProjectStageBadgeProps) {
    return (
        <span
            aria-label={t('projects.stage.aria_label', { stage: stageLabel })}
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                stageStyles[stage],
                className,
            )}
        >
            {stageLabel}
        </span>
    )
}
