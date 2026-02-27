import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/20/solid'

export interface Comment {
    id: number
    user: { name: string; imageUrl: string | null }
    body: string
    date: string
    dateTime: string
}

interface CommentItemProps {
    comment: Comment
    isLast: boolean
}

export default function CommentItem({ comment, isLast }: CommentItemProps) {
    return (
        <li>
            <div className="relative pb-6">
                {!isLast && (
                    <span
                        aria-hidden
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-white/10"
                    />
                )}
                <div className="relative flex items-start gap-x-3">
                    <div className="relative shrink-0">
                        {comment.user.imageUrl ? (
                            <img
                                alt=""
                                src={comment.user.imageUrl}
                                className="size-10 rounded-full bg-gray-100 ring-8 ring-white outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:ring-gray-950 dark:outline-white/10"
                            />
                        ) : (
                            <span className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 ring-8 ring-white dark:bg-indigo-900 dark:text-indigo-300 dark:ring-gray-950">
                                {comment.user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <span className="absolute -right-1 -bottom-0.5 rounded-tl bg-white px-0.5 py-px dark:bg-gray-950">
                            <ChatBubbleLeftEllipsisIcon aria-hidden className="size-4 text-gray-400 dark:text-gray-500" />
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {comment.user.name}
                        </span>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            <time dateTime={comment.dateTime}>Comentó {comment.date}</time>
                        </p>
                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                            <p>{comment.body}</p>
                        </div>
                    </div>
                </div>
            </div>
        </li>
    )
}
