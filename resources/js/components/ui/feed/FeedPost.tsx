import { useState } from 'react'
import PostActions from '@/components/ui/feed/PostActions'
import PostComments, { type Comment } from '@/components/ui/feed/PostComments'

export interface Post {
    id: number
    user: {
        name: string
        imageUrl: string | null
    }
    content: string
    date: string
    dateTime: string
    likes: number
    comments: number
    coins: number
    isLiked: boolean
    commentsList: Comment[]
}

interface FeedPostProps {
    post: Post
    processingAction: 'potenciar' | 'comments' | 'like' | 'share' | null
    onToggleLike: (id: number) => void
    onPotenciar: (id: number) => void
}

export default function FeedPost({ post, processingAction, onToggleLike, onPotenciar }: FeedPostProps) {
    const [commentsOpen, setCommentsOpen] = useState(false)

    return (
        <li className="px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <div className="flex gap-x-3">
                {post.user.imageUrl ? (
                    <img
                        src={post.user.imageUrl}
                        alt=""
                        className="size-10 shrink-0 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                    />
                ) : (
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 outline -outline-offset-1 outline-black/5 dark:bg-indigo-900 dark:text-indigo-300 dark:outline-white/10">
                        {post.user.name.charAt(0).toUpperCase()}
                    </span>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{post.user.name}</span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <time dateTime={post.dateTime} className="text-sm text-gray-500 dark:text-gray-400">
                            {post.date}
                        </time>
                    </div>

                    <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{post.content}</p>

                    <PostActions
                        postId={post.id}
                        likes={post.likes}
                        comments={post.comments}
                        coins={post.coins}
                        isLiked={post.isLiked}
                        processingAction={processingAction}
                        commentsOpen={commentsOpen}
                        onToggleLike={onToggleLike}
                        onToggleComments={() => setCommentsOpen((prev) => !prev)}
                        onPotenciar={onPotenciar}
                    />

                    {commentsOpen && <PostComments postId={post.id} comments={post.commentsList} />}
                </div>
            </div>
        </li>
    )
}
