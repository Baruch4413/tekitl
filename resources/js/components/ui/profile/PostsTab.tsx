'use client'

import { useState } from 'react'
import { InfiniteScroll, router } from '@inertiajs/react'
import { toast } from 'sonner'
import FeedPost, { type Post } from '@/components/ui/feed/FeedPost'
import CommentsIcon from '@/components/vector-graphics/CommentsIcon'
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
                const next = { ...prev }
                delete next[id]
                return next
            }),
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
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
                                    const next = { ...prev }
                                    delete next[id]
                                    return next
                                })
                            }
                        }}
                    />
                ))}
            </InfiniteScroll>

            {posts.data.length === 0 && (
                <div className="px-4 py-6 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-white/[0.06] dark:bg-white/[0.02]">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                            <CommentsIcon className="size-6 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-white">Sin publicaciones</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Este usuario aún no ha publicado nada.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
