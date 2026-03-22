'use client'

import { useState } from 'react'
import { InfiniteScroll, router, usePage } from '@inertiajs/react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { toast } from 'sonner'
import Textarea from '@/components/ui/comments/Textarea'
import FeedPost, { type Post } from '@/components/ui/feed/FeedPost'
import MobileSidebar from '@/components/ui/MobileSidebar'
import WelcomeSidebar from '@/components/ui/WelcomeSidebar'
import { potenciar, toggleLike } from '@/actions/App/Http/Controllers/PostController'

const suggestions = [
    {
        name: 'Lindsay Walton',
        handle: '@lwalton',
        imageUrl:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Whitney Francis',
        handle: '@whitneyf',
        imageUrl:
            'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
        name: 'Courtney Henry',
        handle: '@courtney_h',
        imageUrl:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
]

const trending = [
    { tag: '#ios-app', category: 'Tecnología · Tendencia', count: '1.2K posts' },
    { tag: '#mobile-api', category: 'Desarrollo · Tendencia', count: '892 posts' },
    { tag: '#tailwindcss', category: 'Diseño · Tendencia', count: '2.4K posts' },
    { tag: '#relay-service', category: 'Infraestructura', count: '456 posts' },
    { tag: '#android-app', category: 'Tecnología', count: '234 posts' },
]

function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

interface PaginatedPosts {
    data: Post[]
}

interface WelcomeProps {
    posts: PaginatedPosts
}

export default function Welcome({ posts }: WelcomeProps) {
    const { auth } = usePage().props
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [processingActions, setProcessingActions] = useState<Record<number, string>>({})
    const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set(['@lwalton']))

    const withProcessing = (id: number, action: string, url: string) => {
        router.post(url, {}, {
            preserveScroll: true,
            onBefore: () => setProcessingActions((prev) => ({ ...prev, [id]: action })),
            onFinish: () => setProcessingActions((prev) => {
                const { [id]: _, ...rest } = prev
                return rest
            }),
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
        })
    }

    const handlePotenciar = (id: number) => withProcessing(id, 'potenciar', potenciar.url(id))

    const handleToggleLike = (id: number) => withProcessing(id, 'like', toggleLike.url(id))

    const toggleFollow = (handle: string) =>
        setFollowedUsers((prev) => {
            const next = new Set(prev)
            next.has(handle) ? next.delete(handle) : next.add(handle)
            return next
        })

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Mobile sidebar */}
            <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="home" />

            {/* Desktop fixed sidebar */}
            <div className="hidden xl:fixed xl:inset-y-0 xl:left-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
                <WelcomeSidebar currentPage="home" />
            </div>

            {/* Main content */}
            <div className="xl:pl-72 lg:pr-96">
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
                        <h1 className="text-base font-bold text-gray-900 dark:text-white">Inicio</h1>
                    </div>
                </div>

                {/* Desktop sticky header */}
                <div className="sticky top-0 z-40 hidden border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-white/5 dark:bg-gray-950/80 xl:block">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inicio</h1>
                </div>

                {/* Composer */}
                {auth.user && (
                    <div className="flex gap-x-3 border-b border-gray-200 px-4 py-4 dark:border-white/5">
                        <Textarea />
                    </div>
                )}

                {/* Feed */}
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
            </div>

            {/* Right sidebar */}
            <aside className="hidden overflow-y-auto border-l border-gray-200 bg-white dark:border-white/5 dark:bg-gray-950 lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-96 lg:flex-col">
                {/* Search */}
                <div className="sticky top-0 bg-white px-4 pt-4 pb-3 dark:bg-gray-950">
                    <div className="flex items-center gap-x-3 rounded-full bg-gray-100 px-4 py-2.5 dark:bg-white/5">
                        <MagnifyingGlassIcon className="size-4 shrink-0 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Buscar"
                            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white dark:placeholder:text-gray-500"
                        />
                    </div>
                </div>

                {/* Trending */}
                <div className="mx-4 mt-3 overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5">
                    <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Tendencias</h2>
                    </div>
                    <ul role="list">
                        {trending.map((item, index) => (
                            <li key={item.tag}>
                                <a
                                    href="#"
                                    className={classNames(
                                        index < trending.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : '',
                                        'block px-4 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/5',
                                    )}
                                >
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{item.tag}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.count}</p>
                                </a>
                            </li>
                        ))}
                    </ul>
                    <div className="px-4 py-3">
                        <a href="#" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                            Ver más
                        </a>
                    </div>
                </div>

                {/* Who to follow */}
                <div className="mx-4 mt-4 overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/5">
                    <div className="border-b border-gray-200 px-4 py-3 dark:border-white/10">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">A quién seguir</h2>
                    </div>
                    <ul role="list">
                        {suggestions.map((person, index) => {
                            const isFollowing = followedUsers.has(person.handle)
                            return (
                                <li
                                    key={person.handle}
                                    className={classNames(
                                        index < suggestions.length - 1 ? 'border-b border-gray-200 dark:border-white/5' : '',
                                        'flex items-center gap-x-3 px-4 py-3',
                                    )}
                                >
                                    <img
                                        src={person.imageUrl}
                                        alt=""
                                        className="size-10 shrink-0 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                            {person.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{person.handle}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleFollow(person.handle)}
                                        className={classNames(
                                            isFollowing
                                                ? 'bg-white text-gray-900 ring-1 ring-gray-300 hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200 dark:bg-gray-800 dark:text-white dark:ring-white/10 dark:hover:bg-rose-950 dark:hover:text-rose-400'
                                                : 'bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100',
                                            'shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
                                        )}
                                    >
                                        {isFollowing ? 'Siguiendo' : 'Seguir'}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                    <div className="px-4 py-3">
                        <a href="#" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                            Ver más
                        </a>
                    </div>
                </div>

                <div className="mt-auto px-4 py-4">
                    <p className="text-xs text-gray-400 dark:text-gray-600">© 2026 Tekitl · Privacidad · Términos</p>
                </div>
            </aside>
        </div>
    )
}
