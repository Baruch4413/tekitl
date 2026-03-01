'use client'

import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Bars3Icon, CalendarDaysIcon } from '@heroicons/react/20/solid'
import CoinIcon from '@/components/vector-graphics/CoinIcon'
import SkillsIcon from '@/components/vector-graphics/SkillsIcon'
import CommentsIcon from '@/components/vector-graphics/CommentsIcon'
import InfoIcon from '@/components/vector-graphics/InfoIcon'
import { formatCount } from '@/lib/utils'
import { cn } from '@/lib/utils'
import CoverPhoto from '@/components/ui/CoverPhoto'
import MobileSidebar from '@/components/ui/MobileSidebar'
import WelcomeSidebar from '@/components/ui/WelcomeSidebar'
import UserAvatar from '@/components/ui/UserAvatar'
import PostsTab from '@/components/ui/profile/PostsTab'
import TalentosTab, { type Talent } from '@/components/ui/profile/TalentosTab'
import InformacionTab from '@/components/ui/profile/InformacionTab'
import type { Post } from '@/components/ui/feed/FeedPost'
import {
    ChatBubbleBottomCenterTextIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/outline'

interface ProfileUser {
    id: number
    name: string
    avatarUrl: string | null
    coverPhotoUrl: string | null
    coverPhotoPositionY: number
    createdAt: string
    postsCount: number
    coins: number
    bio: string | null
    locationName: string | null
    locationPlaceId: string | null
    locationLat: number | null
    locationLng: number | null
    birthdate: string | null
    publicPhone: string | null
    contactEmail: string | null
    languages: string[] | null
}

interface PaginatedPosts {
    data: Post[]
}

type Tab = 'posts' | 'talentos' | 'informacion'

const tabs: { id: Tab; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'posts', label: 'Posts', icon: (props) => <CommentsIcon {...props} /> },
    { id: 'talentos', label: 'Talentos', icon: (props) => <SkillsIcon {...props} /> },
    { id: 'informacion', label: 'Información', icon: (props) => <InfoIcon {...props} /> },
]

interface UserShowProps {
    profileUser: ProfileUser
    posts: PaginatedPosts
    talents: Talent[]
    occupations?: string[]
    googleMapsApiKey: string | null
}

export default function UserShow({ profileUser, posts, talents, occupations, googleMapsApiKey }: UserShowProps) {
    const { auth } = usePage<{ auth: { user?: { id: number } } }>().props
    const isOwner = auth.user?.id === profileUser.id
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('posts')

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
                    <CoverPhoto
                        imageUrl={profileUser.coverPhotoUrl}
                        positionY={profileUser.coverPhotoPositionY}
                        isOwner={isOwner}
                    />
                    <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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
                                <CoinIcon className="size-4" />
                                {formatCount(profileUser.coins)} coins
                            </span>
                            <span>{profileUser.postsCount} {profileUser.postsCount === 1 ? 'post' : 'posts'}</span>
                        </div>
                    </div>
                </div>

                {/* Tab navigation */}
                <div className="mt-6 border-b border-gray-200 dark:border-white/10">
                    <nav className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                        <ul role="list" className="flex gap-x-1">
                            {tabs.map((tab) => (
                                <li key={tab.id}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            tab.id === activeTab
                                                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                                            'flex items-center gap-x-2 whitespace-nowrap px-1 py-4 text-sm font-semibold transition-colors',
                                        )}
                                    >
                                        <tab.icon aria-hidden className="size-4 shrink-0" />
                                        {tab.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Tab content */}
                <div className="mx-auto max-w-5xl">
                    {activeTab === 'posts' && <PostsTab posts={posts} />}
                    {activeTab === 'talentos' && (
                        <TalentosTab talents={talents} occupations={occupations} isOwner={isOwner} />
                    )}
                    {activeTab === 'informacion' && (
                        <InformacionTab
                            profileInfo={{
                                bio: profileUser.bio,
                                locationName: profileUser.locationName,
                                locationPlaceId: profileUser.locationPlaceId,
                                locationLat: profileUser.locationLat,
                                locationLng: profileUser.locationLng,
                                birthdate: profileUser.birthdate,
                                publicPhone: profileUser.publicPhone,
                                contactEmail: profileUser.contactEmail,
                                languages: profileUser.languages,
                            }}
                            isOwner={isOwner}
                            googleMapsApiKey={googleMapsApiKey}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
