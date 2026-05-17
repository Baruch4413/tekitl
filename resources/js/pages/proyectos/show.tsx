'use client';

import { Bars3Icon } from '@heroicons/react/20/solid';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    projectIndex as fetchComments,
    projectStore,
} from '@/actions/App/Http/Controllers/CommentController';
import { Button } from '@/components/ui/button';
import PostComments, { type Comment } from '@/components/ui/feed/PostComments';
import MobileSidebar from '@/components/ui/MobileSidebar';
import CrowdfundingProgress from '@/components/ui/proyectos/CrowdfundingProgress';
import ImageGallery from '@/components/ui/proyectos/ImageGallery';
import ProjectHeader from '@/components/ui/proyectos/ProjectHeader';
import ProjectRoles, {
    type ProjectRole,
} from '@/components/ui/proyectos/ProjectRoles';
import ProjectStageActions, {
    type AllowedTransition,
} from '@/components/ui/proyectos/ProjectStageActions';
import { type ProjectStageValue } from '@/components/ui/proyectos/ProjectStageBadge';
import ProjectTimeline from '@/components/ui/proyectos/ProjectTimeline';
import { type TimelineEntry } from '@/components/ui/proyectos/ProjectTimelineEntry';
import WelcomeSidebar from '@/components/ui/WelcomeSidebar';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ProjectImage {
    id: number;
    title: string | null;
    description: string | null;
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
}

interface CurrentUserApplication {
    id: number;
    roleId: number;
    status: 'pending' | 'active';
}

interface ProjectData {
    id: number;
    title: string | null;
    description: string | null;
    goal: number;
    stage: ProjectStageValue;
    stageLabel: string;
    allowedTransitions: AllowedTransition[];
    roles: ProjectRole[];
    images: ProjectImage[];
}

interface PostData {
    id: number;
    user: {
        id: number;
        name: string;
        imageUrl: string | null;
    };
    content: string;
    date: string;
    dateTime: string;
    coins: number;
    isEndorsedByCurrentUser: boolean;
}

interface TimelineData {
    entries: TimelineEntry[];
    nextCursor: string | null;
}

interface ProyectoShowProps {
    project: ProjectData;
    post: PostData;
    isOwner: boolean;
    currentUserApplication: CurrentUserApplication | null;
    timeline: TimelineData;
}

type TabId = 'equipo' | 'actividad' | 'comentarios';

export default function ProyectoShow({
    project,
    post,
    isOwner,
    currentUserApplication,
    timeline,
}: ProyectoShowProps) {
    const { auth } = usePage<{ auth: { user: { id: number } | null } }>().props;
    const isAuthenticated = !!auth?.user;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<TabId>('equipo');
    const [commentsList, setCommentsList] = useState<Comment[] | null>(null);
    const [commentsLoading, setCommentsLoading] = useState(false);

    const loadComments = async () => {
        if (commentsList !== null) return;
        setCommentsLoading(true);
        try {
            const response = await fetch(fetchComments.url(project.id));
            const data: Comment[] = await response.json();
            setCommentsList(data);
        } finally {
            setCommentsLoading(false);
        }
    };

    const refreshComments = async () => {
        const response = await fetch(fetchComments.url(project.id));
        const data: Comment[] = await response.json();
        setCommentsList(data);
    };

    useEffect(() => {
        if (activeTab === 'comentarios') {
            loadComments().catch(() => {
                setCommentsLoading(false);
                setCommentsList([]);
            });
        }
    }, [activeTab]);

    const tabs: { id: TabId; labelKey: string }[] = [
        { id: 'equipo', labelKey: 'projects.show.tabs.equipo' },
        { id: 'actividad', labelKey: 'projects.show.tabs.actividad' },
        { id: 'comentarios', labelKey: 'projects.show.tabs.comentarios' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <MobileSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentPage="home"
            />

            <div className="hidden xl:fixed xl:inset-y-0 xl:left-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
                <WelcomeSidebar />
            </div>

            <div className="xl:pl-72">
                {/* Mobile top bar */}
                <div className="sticky top-0 z-40 flex h-14 items-center gap-x-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm xl:hidden dark:border-white/5 dark:bg-gray-950/80">
                    <Button
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="-m-2.5"
                    >
                        <span className="sr-only">
                            {t('projects.show.open_menu')}
                        </span>
                        <Bars3Icon aria-hidden className="size-5" />
                    </Button>
                    <div className="flex-1 text-center">
                        <h1 className="text-base font-bold text-gray-900 dark:text-white">
                            {t('projects.show.title')}
                        </h1>
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

                    {/* Image gallery */}
                    <ImageGallery
                        images={project.images}
                        isOwner={isOwner}
                        projectId={project.id}
                    />
                </div>

                {/* Tab navigation */}
                <div className="border-b border-gray-200 dark:border-white/10">
                    <nav className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                        <ul role="list" className="-mb-px flex gap-x-6">
                            {tabs.map((tab) => (
                                <li key={tab.id}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            tab.id === activeTab
                                                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200',
                                            'border-b-2 px-1 py-3 text-sm font-semibold whitespace-nowrap transition-colors',
                                        )}
                                    >
                                        {t(tab.labelKey)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Tab: Equipo */}
                    {activeTab === 'equipo' && (
                        <div className="space-y-6">
                            {/* Progress (with stage transition actions for owner) */}
                            <CrowdfundingProgress
                                coins={post.coins}
                                roles={project.roles}
                            >
                                {isOwner &&
                                    project.allowedTransitions.length > 0 && (
                                        <ProjectStageActions
                                            projectId={project.id}
                                            allowedTransitions={
                                                project.allowedTransitions
                                            }
                                        />
                                    )}
                            </CrowdfundingProgress>

                            {/* Roles buscados */}
                            <ProjectRoles
                                projectId={project.id}
                                projectStage={project.stage}
                                roles={project.roles}
                                isOwner={isOwner}
                                isAuthenticated={isAuthenticated}
                                currentUserApplication={currentUserApplication}
                            />

                        </div>
                    )}

                    {/* Tab: Actividad */}
                    {activeTab === 'actividad' && (
                        <div>
                            <ProjectTimeline
                                projectId={project.id}
                                initialEntries={timeline.entries}
                                initialNextCursor={timeline.nextCursor}
                                isOwner={isOwner}
                            />
                        </div>
                    )}

                    {/* Tab: Comentarios */}
                    {activeTab === 'comentarios' && (
                        <div>
                            {commentsLoading ? (
                                <div className="mt-4 space-y-3">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-white/10" />
                                </div>
                            ) : commentsList !== null ? (
                                <PostComments
                                    storeUrl={projectStore.url(project.id)}
                                    comments={commentsList}
                                    onCommentAdded={refreshComments}
                                />
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
