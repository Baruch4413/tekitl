import {
    ChatBubbleOvalLeftIcon,
    HeartIcon,
    ShareIcon,
    RocketLaunchIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Link } from '@inertiajs/react'
import CoinIcon from '@/components/vector-graphics/CoinIcon'
import { formatCount } from '@/lib/utils'
import { show as showProject } from '@/actions/App/Http/Controllers/ProjectController'

function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

const actionBase = 'group flex items-center gap-x-1.5 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50'

type ProcessingAction = 'potenciar' | 'comments' | 'like' | 'share' | null

interface PostActionsProps {
    postId: number
    likes: number
    comments: number
    coins: number
    isLiked: boolean
    isPoweredByCurrentUser: boolean
    processingAction: ProcessingAction
    commentsOpen: boolean
    onToggleLike: (id: number) => void
    onToggleComments: () => void
    onPotenciar: (id: number) => void
    hasProject?: boolean
    isOwner?: boolean
}

export default function PostActions({
    postId,
    likes,
    comments,
    coins,
    isLiked,
    isPoweredByCurrentUser,
    processingAction,
    commentsOpen,
    onToggleLike,
    onToggleComments,
    onPotenciar,
    hasProject,
    isOwner,
}: PostActionsProps) {
    return (
        <div className="mt-3 flex items-center gap-x-5">
            <button
                onClick={() => onPotenciar(postId)}
                disabled={processingAction === 'potenciar'}
                className={classNames(
                    actionBase,
                    isPoweredByCurrentUser
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-gray-400 hover:text-amber-500 dark:hover:text-amber-400',
                )}
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
                        ? 'text-pink-500 dark:text-pink-400'
                        : 'text-gray-400 hover:text-pink-500 dark:hover:text-pink-400',
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
            {isOwner && !hasProject && (
                <Link
                    href={showProject.url(postId)}
                    className={classNames(actionBase, 'text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400')}
                >
                    <RocketLaunchIcon className="size-4 transition-transform group-hover:scale-110" />
                    <span className="text-xs">Crear proyecto</span>
                </Link>
            )}
            {hasProject && (
                <Link
                    href={showProject.url(postId)}
                    className={classNames(actionBase, 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300')}
                >
                    <RocketLaunchIcon className="size-4 transition-transform group-hover:scale-110" />
                    <span className="text-xs">Ver proyecto</span>
                </Link>
            )}
        </div>
    )
}
