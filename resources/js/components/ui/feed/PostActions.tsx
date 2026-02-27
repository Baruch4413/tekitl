import {
    ChatBubbleOvalLeftIcon,
    HeartIcon,
    ShareIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import CoinIcon from '@/components/vector-graphics/CoinIcon'

function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

function formatCount(count: number): string {
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}M`
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(count % 1_000 === 0 ? 0 : 1)}K`
    }
    return count.toString()
}

const actionBase = 'group flex items-center gap-x-1.5 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50'

type ProcessingAction = 'potenciar' | 'comments' | 'like' | 'share' | null

interface PostActionsProps {
    postId: number
    likes: number
    comments: number
    coins: number
    isLiked: boolean
    processingAction: ProcessingAction
    commentsOpen: boolean
    onToggleLike: (id: number) => void
    onToggleComments: () => void
    onPotenciar: (id: number) => void
}

export default function PostActions({
    postId,
    likes,
    comments,
    coins,
    isLiked,
    processingAction,
    commentsOpen,
    onToggleLike,
    onToggleComments,
    onPotenciar,
}: PostActionsProps) {
    return (
        <div className="mt-3 flex items-center gap-x-5">
            <button
                onClick={() => onPotenciar(postId)}
                disabled={processingAction === 'potenciar'}
                className={classNames(actionBase, 'text-gray-400 hover:text-amber-600 dark:hover:text-amber-400')}
            >
                <CoinIcon className="size-4 transition-transform group-hover:scale-110" />
                <span className="text-xs">{formatCount(coins)}</span>
            </button>
            <button
                onClick={onToggleComments}
                disabled={processingAction === 'comments'}
                className={classNames(
                    actionBase,
                    commentsOpen
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400',
                )}
            >
                <ChatBubbleOvalLeftIcon className="size-4 transition-transform group-hover:scale-110" />
                <span className="text-xs">{comments}</span>
            </button>
            <button
                onClick={() => onToggleLike(postId)}
                disabled={processingAction === 'like'}
                className={classNames(
                    actionBase,
                    isLiked
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-gray-400 hover:text-pink-600 dark:hover:text-pink-400',
                )}
            >
                {isLiked ? (
                    <HeartSolidIcon className="size-4 transition-transform group-hover:scale-110" />
                ) : (
                    <HeartIcon className="size-4 transition-transform group-hover:scale-110" />
                )}
                <span className="text-xs">{likes}</span>
            </button>
            <button
                disabled={processingAction === 'share'}
                className={classNames(actionBase, 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400')}
            >
                <ShareIcon className="size-4 transition-transform group-hover:scale-110" />
            </button>
        </div>
    )
}
