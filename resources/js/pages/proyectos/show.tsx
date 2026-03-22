'use client'

import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Bars3Icon } from '@heroicons/react/20/solid'
import { toast } from 'sonner'
import InlineSaveButton from '@/components/ui/InlineSaveButton'
import MobileSidebar from '@/components/ui/MobileSidebar'
import WelcomeSidebar from '@/components/ui/WelcomeSidebar'
import ProjectHeader from '@/components/ui/proyectos/ProjectHeader'
import ImageGallery from '@/components/ui/proyectos/ImageGallery'
import CrowdfundingProgress from '@/components/ui/proyectos/CrowdfundingProgress'
import PostComments, { type Comment } from '@/components/ui/feed/PostComments'
import PostActions from '@/components/ui/feed/PostActions'
import { update as updateProject } from '@/actions/App/Http/Controllers/ProjectController'
import { potenciar, toggleLike } from '@/actions/App/Http/Controllers/PostController'
import { index as fetchComments } from '@/actions/App/Http/Controllers/CommentController'

interface ProjectImage {
    id: number
    title: string | null
    description: string | null
    thumbnailUrl: string
    mediumUrl: string
    largeUrl: string
}

interface ProjectData {
    id: number
    title: string | null
    description: string | null
    goal: number
    images: ProjectImage[]
}

interface PostData {
    id: number
    user: {
        id: number
        name: string
        imageUrl: string | null
    }
    content: string
    date: string
    dateTime: string
    coins: number
    likes: number
    isLiked: boolean
    isPoweredByCurrentUser: boolean
    comments: number
}

interface ProyectoShowProps {
    project: ProjectData
    post: PostData
    isOwner: boolean
}

export default function ProyectoShow({ project, post, isOwner }: ProyectoShowProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [editingGoal, setEditingGoal] = useState(false)
    const [goal, setGoal] = useState(project.goal.toString())
    const [processing, setProcessing] = useState(false)
    const [commentsOpen, setCommentsOpen] = useState(false)
    const [commentsList, setCommentsList] = useState<Comment[] | null>(null)
    const [processingAction, setProcessingAction] = useState<string | null>(null)

    const saveGoal = () => {
        router.patch(updateProject.url(project.id), {
            title: project.title ?? '',
            description: project.description ?? '',
            goal: parseInt(goal),
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingGoal(false),
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
        })
    }

    const handlePotenciar = () => {
        setProcessing(true)
        router.post(potenciar.url(post.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
        })
    }

    const handleToggleLike = () => {
        setProcessingAction('like')
        router.post(toggleLike.url(post.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessingAction(null),
            onError: (errors) => {
                Object.values(errors).forEach((msg) => toast.error(msg))
            },
        })
    }

    const handleToggleComments = async () => {
        if (commentsList !== null) {
            setCommentsOpen((prev) => !prev)
            return
        }

        setProcessingAction('comments')
        try {
            const response = await fetch(fetchComments.url(post.id))
            const data: Comment[] = await response.json()
            setCommentsList(data)
            setCommentsOpen(true)
        } finally {
            setProcessingAction(null)
        }
    }

    const refreshComments = async () => {
        const response = await fetch(fetchComments.url(post.id))
        const data: Comment[] = await response.json()
        setCommentsList(data)
    }

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
                        <h1 className="text-base font-bold text-gray-900 dark:text-white">Proyecto</h1>
                    </div>
                </div>

                <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Project header */}
                    <ProjectHeader
                        projectId={project.id}
                        title={project.title}
                        description={project.description}
                        user={post.user}
                        date={post.date}
                        dateTime={post.dateTime}
                        isOwner={isOwner}
                    />

                    {/* Image gallery */}
                    <ImageGallery images={project.images} isOwner={isOwner} projectId={project.id} />

                    {/* Crowdfunding progress */}
                    <div className="mt-6">
                        {isOwner && editingGoal ? (
                            <div
                                className="mb-3 flex items-center gap-x-2"
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget)) {
                                        setGoal(project.goal.toString())
                                        setEditingGoal(false)
                                    }
                                }}
                            >
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta:</label>
                                <input
                                    type="number"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveGoal()
                                        if (e.key === 'Escape') { setGoal(project.goal.toString()); setEditingGoal(false) }
                                    }}
                                    autoFocus
                                    min={10}
                                    className="h-9 w-32 rounded-xl border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                                />
                                <InlineSaveButton onClick={saveGoal} />
                            </div>
                        ) : isOwner ? (
                            <button
                                onClick={() => setEditingGoal(true)}
                                className="mb-3 text-xs text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                Editar meta
                            </button>
                        ) : null}
                        <CrowdfundingProgress
                            coins={post.coins}
                            goal={project.goal}
                            onPotenciar={handlePotenciar}
                            processing={processing}
                            isPoweredByCurrentUser={post.isPoweredByCurrentUser}
                        />
                    </div>

                    {/* Post content */}
                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-white/10">
                        <p className="text-[2rem]/snug text-gray-800 dark:text-gray-100">{post.content}</p>
                    </div>

                    {/* Post actions */}
                    <PostActions
                        postId={post.id}
                        likes={post.likes}
                        comments={post.comments}
                        coins={post.coins}
                        isLiked={post.isLiked}
                        isPoweredByCurrentUser={post.isPoweredByCurrentUser}
                        processingAction={processingAction as 'potenciar' | 'comments' | 'like' | 'share' | null}
                        commentsOpen={commentsOpen}
                        onToggleLike={handleToggleLike}
                        onToggleComments={handleToggleComments}
                        onPotenciar={() => handlePotenciar()}
                    />

                    {/* Comments */}
                    {commentsOpen && commentsList && (
                        <PostComments postId={post.id} comments={commentsList} onCommentAdded={refreshComments} />
                    )}
                </div>
            </div>
        </div>
    )
}
