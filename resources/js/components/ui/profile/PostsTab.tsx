'use client'

import { useState } from 'react'
import { InfiniteScroll, router } from '@inertiajs/react'
import FeedPost, { type Post } from '@/components/ui/feed/FeedPost'
import { potenciar, toggleLike } from '@/actions/App/Http/Controllers/PostController'

interface PaginatedPosts {
    data: Post[]
}

interface PostsTabProps {
    posts: PaginatedPosts
}

export default function PostsTab({ posts }: PostsTabProps) {
    const [processingActions, setProcessingActions] = useState<Record<number, string>>({})

    const withProcessing = (id: number, action: string, url: string) => {
        router.post(url, {}, {
            preserveScroll: true,
            onBefore: () => setProcessingActions((prev) => ({ ...prev, [id]: action })),
            onFinish: () => setProcessingActions((prev) => {
                const { [id]: _, ...rest } = prev
                return rest
            }),
        })
    }

    const handlePotenciar = (id: number) => withProcessing(id, 'potenciar', potenciar.url(id))
    const handleToggleLike = (id: number) => withProcessing(id, 'like', toggleLike.url(id))

    return (
        <div>
            <InfiniteScroll data="posts" onlyNext as="ul" role="list" className="divide-y divide-gray-100 dark:divide-white/5">
                {posts.data.map((post) => (
                    <FeedPost
                        key={post.id}
                        post={post}
                        processingAction={(processingActions[post.id] as 'potenciar' | 'comments' | 'like' | 'share') ?? null}
                        onToggleLike={handleToggleLike}
                        onPotenciar={handlePotenciar}
                        onSetProcessing={(id: number, action: string | null) => {
                            if (action) {
                                setProcessingActions((prev) => ({ ...prev, [id]: action }))
                            } else {
                                setProcessingActions((prev) => {
                                    const { [id]: _, ...rest } = prev
                                    return rest
                                })
                            }
                        }}
                    />
                ))}
            </InfiniteScroll>

            {posts.data.length === 0 && (
                <div className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                    Este usuario aún no ha publicado nada.
                </div>
            )}
        </div>
    )
}
