import {
    ChatBubbleOvalLeftIcon,
    ArrowPathIcon,
    HeartIcon,
    ShareIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

interface PostActionsProps {
    postId: number
    likes: number
    comments: number
    reposts: number
    isLiked: boolean
    commentsOpen: boolean
    onToggleLike: (id: number) => void
    onToggleComments: () => void
}

export default function PostActions({
    postId,
    likes,
    comments,
    reposts,
    isLiked,
    commentsOpen,
    onToggleLike,
    onToggleComments,
}: PostActionsProps) {
    const likeCount = likes + (isLiked ? 1 : 0)

    return (
        <div className="mt-3 flex items-center gap-x-5">
            <button
                onClick={onToggleComments}
                className={classNames(
                    commentsOpen
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400',
                    'group flex items-center gap-x-1.5 transition-colors',
                )}
            >
                <ChatBubbleOvalLeftIcon className="size-4 transition-transform group-hover:scale-110" />
                <span className="text-xs">{comments}</span>
            </button>
            <button className="group flex items-center gap-x-1.5 text-gray-400 transition-colors hover:text-green-600 dark:hover:text-green-400">
                <ArrowPathIcon className="size-4 transition-transform group-hover:scale-110" />
                <span className="text-xs">{reposts}</span>
            </button>
            <button
                onClick={() => onToggleLike(postId)}
                className={classNames(
                    isLiked
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-gray-400 hover:text-pink-600 dark:hover:text-pink-400',
                    'group flex items-center gap-x-1.5 transition-colors',
                )}
            >
                {isLiked ? (
                    <HeartSolidIcon className="size-4 transition-transform group-hover:scale-110" />
                ) : (
                    <HeartIcon className="size-4 transition-transform group-hover:scale-110" />
                )}
                <span className="text-xs">{likeCount}</span>
            </button>
            <button className="group flex items-center gap-x-1.5 text-gray-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400">
                <ShareIcon className="size-4 transition-transform group-hover:scale-110" />
            </button>
        </div>
    )
}
