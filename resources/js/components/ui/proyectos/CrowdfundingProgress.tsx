import CoinIcon from '@/components/vector-graphics/CoinIcon'
import { formatCount } from '@/lib/utils'
import { type ProjectRole } from '@/components/ui/proyectos/ProjectRoles'

interface CrowdfundingProgressProps {
    coins: number
    roles: ProjectRole[]
}

export default function CrowdfundingProgress({ coins, roles }: CrowdfundingProgressProps) {
    const totalSlots = roles.reduce((sum, r) => sum + r.slots, 0)
    const filledSlots = roles.reduce((sum, r) => sum + r.filledSlots, 0)
    const percentage = totalSlots > 0 ? Math.min(Math.round((filledSlots / totalSlots) * 100), 100) : 0

    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {filledSlots} / {totalSlots} voluntarios
                    </span>
                </div>
                <div className="flex items-center gap-x-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 dark:border-amber-500/20 dark:bg-amber-500/10">
                    <CoinIcon className="size-3.5" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{formatCount(coins)}</span>
                </div>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {totalSlots > 0 && (
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{percentage}% completo</p>
            )}
        </div>
    )
}
