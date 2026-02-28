'use client'

import { useState } from 'react'
import { InfiniteScroll, router } from '@inertiajs/react'
import { Bars3Icon, CalendarDaysIcon } from '@heroicons/react/20/solid'
import { FireIcon } from '@heroicons/react/24/outline'
import FeedPost, { type Post } from '@/components/ui/feed/FeedPost'
import MobileSidebar from '@/components/ui/MobileSidebar'
import WelcomeSidebar from '@/components/ui/WelcomeSidebar'
import UserAvatar from '@/components/ui/UserAvatar'
import { potenciar, toggleLike } from '@/actions/App/Http/Controllers/PostController'

interface ProfileUser {
    id: number
    name: string
    avatarUrl: string | null
    createdAt: string
    postsCount: number
    coins: number
}

interface PaginatedPosts {
    data: Post[]
}

interface UserShowProps {
    profileUser: ProfileUser
    posts: PaginatedPosts
}

export default function UserShow({ profileUser, posts }: UserShowProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
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
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="home" />

            <div className="hidden xl:fixed xl:inset-y-0 xl:left-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
                <WelcomeSidebar />
            </div>

            <div className="xl:pl-72">
                {/* Mobile top bar */}
                <div className="sticky top-0 z-40 flex h-14 items-center gap-x-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm dark:border-white/5 dark:bg-gray-950/80 xl:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
                    >
                        <span className="sr-only">Abrir menú</span>
                        <Bars3Icon aria-hidden className="size-5" />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-base font-bold text-gray-900 dark:text-white">{profileUser.name}</h1>
                    </div>
                </div>

                {/* Profile heading */}
                <div>
                    <div className="h-32 w-full bg-gradient-to-r from-indigo-500 to-purple-600 lg:h-48" />
                    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <div className="-mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                            <div className="flex">
                                <UserAvatar
                                    name={profileUser.name}
                                    imageUrl={profileUser.avatarUrl}
                                    size="lg"
                                    className="ring-4 ring-white dark:ring-gray-950"
                                />
                            </div>
                            <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:pb-1">
                                <div className="mt-6 min-w-0 flex-1">
                                    <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">{profileUser.name}</h1>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-x-1.5">
                                <CalendarDaysIcon className="size-4" />
                                Miembro desde {profileUser.createdAt}
                            </span>
                            <span className="flex items-center gap-x-1.5">
                                <FireIcon className="size-4" />
                                {profileUser.coins} coins
                            </span>
                            <span>{profileUser.postsCount} {profileUser.postsCount === 1 ? 'post' : 'posts'}</span>
                        </div>
                    </div>
                </div>

                {/* Posts feed */}
                <div className="mt-6 border-t border-gray-200 dark:border-white/5">
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
            </div>
        </div>
    )
}
