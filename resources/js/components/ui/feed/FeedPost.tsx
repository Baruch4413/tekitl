import { useState } from 'react'
import { Link } from '@inertiajs/react'
import PostActions from '@/components/ui/feed/PostActions'
import PostComments, { type Comment } from '@/components/ui/feed/PostComments'
import UserAvatar from '@/components/ui/UserAvatar'
import { index as fetchComments } from '@/actions/App/Http/Controllers/CommentController'
import { show as userProfile } from '@/actions/App/Http/Controllers/UserProfileController'

export interface Post {
    id: number
    user: {
        id: number
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
    isPoweredByCurrentUser: boolean
}

interface FeedPostProps {
    post: Post
    processingAction: 'potenciar' | 'comments' | 'like' | 'share' | null
    onToggleLike: (id: number) => void
    onPotenciar: (id: number) => void
    onSetProcessing: (id: number, action: string | null) => void
}

export default function FeedPost({ post, processingAction, onToggleLike, onPotenciar, onSetProcessing }: FeedPostProps) {
    const [commentsOpen, setCommentsOpen] = useState(false)
    const [commentsList, setCommentsList] = useState<Comment[] | null>(null)

    const handleToggleComments = async () => {
        if (commentsList !== null) {
            setCommentsOpen((prev) => !prev)
            return
        }

        onSetProcessing(post.id, 'comments')
        try {
            const response = await fetch(fetchComments.url(post.id))
            const data: Comment[] = await response.json()
            setCommentsList(data)
            setCommentsOpen(true)
        } finally {
            onSetProcessing(post.id, null)
        }
    }

    const refreshComments = async () => {
        const response = await fetch(fetchComments.url(post.id))
        const data: Comment[] = await response.json()
        setCommentsList(data)
    }

    return (
        <li className="px-4 py-4 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <div className="flex gap-x-3">
                <Link href={userProfile.url(post.user.id)}>
                    <UserAvatar name={post.user.name} imageUrl={post.user.imageUrl} />
                </Link>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-1.5">
                        <Link href={userProfile.url(post.user.id)} className="text-sm font-bold text-gray-900 hover:underline dark:text-white">{post.user.name}</Link>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <time dateTime={post.dateTime} className="text-sm text-gray-500 dark:text-gray-400">
                            {post.date}
                        </time>
                    </div>

                    <p className="mt-1 text-[2rem]/snug text-gray-900 dark:text-gray-100">{post.content}</p>

                    <PostActions
                        postId={post.id}
                        likes={post.likes}
                        comments={post.comments}
                        coins={post.coins}
                        isLiked={post.isLiked}
                        isPoweredByCurrentUser={post.isPoweredByCurrentUser}
                        processingAction={processingAction}
                        commentsOpen={commentsOpen}
                        onToggleLike={onToggleLike}
                        onToggleComments={handleToggleComments}
                        onPotenciar={onPotenciar}
                    />

                    {commentsOpen && commentsList && (
                        <PostComments postId={post.id} comments={commentsList} onCommentAdded={refreshComments} />
                    )}
                </div>
            </div>
        </li>
    )
}
