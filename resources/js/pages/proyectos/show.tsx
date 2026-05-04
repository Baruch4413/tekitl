'use client'

import { Bars3Icon } from '@heroicons/react/20/solid'
import { usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { projectIndex as fetchComments, projectStore } from '@/actions/App/Http/Controllers/CommentController'
import { Button } from '@/components/ui/button'
import PostComments, { type Comment } from '@/components/ui/feed/PostComments'
import MobileSidebar from '@/components/ui/MobileSidebar'
import CrowdfundingProgress from '@/components/ui/proyectos/CrowdfundingProgress'
import ImageGallery from '@/components/ui/proyectos/ImageGallery'
import ProjectHeader from '@/components/ui/proyectos/ProjectHeader'
import ProjectRoles, { type ProjectRole } from '@/components/ui/proyectos/ProjectRoles'
import ProjectStageActions, { type AllowedTransition } from '@/components/ui/proyectos/ProjectStageActions'
import { type ProjectStageValue } from '@/components/ui/proyectos/ProjectStageBadge'
import ProjectTeam from '@/components/ui/proyectos/ProjectTeam'
import ProjectTimeline from '@/components/ui/proyectos/ProjectTimeline'
import { type TimelineEntry } from '@/components/ui/proyectos/ProjectTimelineEntry'
import WelcomeSidebar from '@/components/ui/WelcomeSidebar'

interface ProjectImage {
    id: number
    title: string | null
    description: string | null
    thumbnailUrl: string
    mediumUrl: string
    largeUrl: string
}

interface CurrentUserApplication {
    id: number
    roleId: number
    status: 'pending' | 'active'
}

interface ProjectData {
    id: number
    title: string | null
    description: string | null
    goal: number
    stage: ProjectStageValue
    stageLabel: string
    allowedTransitions: AllowedTransition[]
    roles: ProjectRole[]
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
    isPoweredByCurrentUser: boolean
}

interface TimelineData {
    entries: TimelineEntry[]
    nextCursor: string | null
}

interface ProyectoShowProps {
    project: ProjectData
    post: PostData
    isOwner: boolean
    currentUserApplication: CurrentUserApplication | null
    timeline: TimelineData
}

export default function ProyectoShow({ project, post, isOwner, currentUserApplication, timeline }: ProyectoShowProps) {
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props
    const isAuthenticated = !!auth?.user

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [commentsList, setCommentsList] = useState<Comment[] | null>(null)
    const [commentsLoading, setCommentsLoading] = useState(false)

    const loadComments = async () => {
        if (commentsList !== null) return
        setCommentsLoading(true)
        try {
            const response = await fetch(fetchComments.url(project.id))
            const data: Comment[] = await response.json()
            setCommentsList(data)
        } finally {
            setCommentsLoading(false)
        }
    }

    const refreshComments = async () => {
        const response = await fetch(fetchComments.url(project.id))
        const data: Comment[] = await response.json()
        setCommentsList(data)
    }

    useEffect(() => {
loadComments()
    }, [])

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="home" />

            <div className="hidden xl:fixed xl:inset-y-0 xl:left-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
                <WelcomeSidebar />
            </div>

            <div className="xl:pl-72">
                {/* Mobile top bar */}
                <div className="sticky top-0 z-40 flex h-14 items-center gap-x-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm dark:border-white/5 dark:bg-gray-950/80 xl:hidden">
                    <Button
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="-m-2.5"
                    >
                        <span className="sr-only">Abrir menú</span>
                        <Bars3Icon aria-hidden className="size-5" />
                    </Button>
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
                        stage={project.stage}
                        stageLabel={project.stageLabel}
                    />

                    {/* Stage transition actions (owner only) */}
                    {isOwner && project.allowedTransitions.length > 0 && (
                        <ProjectStageActions
                            projectId={project.id}
                            allowedTransitions={project.allowedTransitions}
                        />
                    )}

                    {/* Image gallery */}
                    <ImageGallery images={project.images} isOwner={isOwner} projectId={project.id} />

                    {/* Progress */}
                    <div className="mt-6">
                        <CrowdfundingProgress coins={post.coins} roles={project.roles} />
                    </div>

                    {/* Roles */}
                    <ProjectRoles
                        projectId={project.id}
                        projectStage={project.stage}
                        roles={project.roles}
                        isOwner={isOwner}
                        isAuthenticated={isAuthenticated}
                        currentUserApplication={currentUserApplication}
                    />

                    {/* Team */}
                    <ProjectTeam roles={project.roles} />

                    {/* Timeline */}
                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-white/10">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Actividad del proyecto</h2>
                        <ProjectTimeline
                            projectId={project.id}
                            initialEntries={timeline.entries}
                            initialNextCursor={timeline.nextCursor}
                            isOwner={isOwner}
                        />
                    </div>

                    {/* Comments */}
                    <div className="mt-6 border-t border-gray-200 pt-6 dark:border-white/10">
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Comentarios</h2>
                        {commentsLoading ? (
                            <div className="mt-4 space-y-3">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                            </div>
                        ) : commentsList !== null ? (
                            <div className="mt-4">
                                <PostComments storeUrl={projectStore.url(project.id)} comments={commentsList} onCommentAdded={refreshComments} />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}
