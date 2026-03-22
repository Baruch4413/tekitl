import CoinIcon from '@/components/vector-graphics/CoinIcon'
import { formatCount } from '@/lib/utils'

interface CrowdfundingProgressProps {
    coins: number
    goal: number
    onPotenciar: () => void
    processing: boolean
    isPoweredByCurrentUser: boolean
}

export default function CrowdfundingProgress({
    coins,
    goal,
    onPotenciar,
    processing,
    isPoweredByCurrentUser,
}: CrowdfundingProgressProps) {
    const percentage = Math.min(Math.round((coins / goal) * 100), 100)

    return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <CoinIcon className="size-5" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCount(coins)} / {formatCount(goal)} coins
                    </span>
                </div>
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{percentage}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="mt-3">
                <button
                    onClick={onPotenciar}
                    disabled={processing}
                    className={`flex items-center gap-x-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                        isPoweredByCurrentUser
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-amber-500 text-white hover:bg-amber-600 dark:hover:bg-amber-400'
                    } disabled:opacity-50`}
                >
                    <CoinIcon className="size-4" />
                    Potenciar
                </button>
            </div>
        </div>
    )
}
