import { Link, usePage } from '@inertiajs/react'
import {
    HomeIcon,
    BellIcon,
    EnvelopeIcon,
    BookmarkIcon,
    UserIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/24/outline'
import { home, configuracion } from '@/routes/index'
import type { Auth } from '@/types/auth'

export type CurrentPage = 'home' | 'configuracion'

function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

const communities = [
    { id: 1, name: 'Planetaria', initial: 'P', color: 'bg-indigo-500' },
    { id: 2, name: 'Protocol', initial: 'P', color: 'bg-purple-500' },
    { id: 3, name: 'Tailwind Labs', initial: 'T', color: 'bg-sky-500' },
]

interface WelcomeSidebarProps {
    currentPage?: CurrentPage
}

export default function WelcomeSidebar({ currentPage = 'home' }: WelcomeSidebarProps) {
    const { auth } = usePage<{ auth?: Auth }>().props
    const user = auth?.user

    const navigation = [
        { id: 'home' as CurrentPage, name: 'Inicio', href: home(), icon: HomeIcon },
        { id: null, name: 'Explorar', href: '#', icon: MagnifyingGlassIcon },
        { id: null, name: 'Notificaciones', href: '#', icon: BellIcon },
        { id: null, name: 'Mensajes', href: '#', icon: EnvelopeIcon },
        { id: null, name: 'Guardados', href: '#', icon: BookmarkIcon },
        { id: null, name: 'Perfil', href: '#', icon: UserIcon },
        { id: 'configuracion' as CurrentPage, name: 'Configuración', href: configuracion(), icon: Cog6ToothIcon },
    ]

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-4 pb-4 dark:border-white/5 dark:bg-gray-950">
            <div className="flex h-16 shrink-0 items-center">
                <img
                    alt="Tekitl"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto dark:hidden"
                />
                <img
                    alt="Tekitl"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    className="h-8 w-auto not-dark:hidden"
                />
            </div>

            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-1">
                    {navigation.map((item) => {
                        const isCurrent = item.id !== null && item.id === currentPage
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={classNames(
                                        isCurrent
                                            ? 'font-bold text-indigo-600 dark:text-indigo-400'
                                            : 'font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-indigo-400',
                                        'group flex items-center gap-x-3 rounded-full px-3 py-3 text-base transition-colors',
                                    )}
                                >
                                    <item.icon
                                        aria-hidden
                                        className={classNames(
                                            isCurrent
                                                ? 'text-indigo-600 dark:text-indigo-400'
                                                : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
                                            'size-6 shrink-0',
                                        )}
                                    />
                                    {item.name}
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/5">
                    <p className="px-3 text-xs font-semibold tracking-wider text-gray-400 uppercase dark:text-gray-500">
                        Comunidades
                    </p>
                    <ul role="list" className="mt-2 space-y-1">
                        {communities.map((c) => (
                            <li key={c.name}>
                                <a
                                    href="#"
                                    className="group flex items-center gap-x-3 rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-indigo-400"
                                >
                                    <span
                                        className={classNames(
                                            c.color,
                                            'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
                                        )}
                                    >
                                        {c.initial}
                                    </span>
                                    {c.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 px-1">
                    <button
                        type="button"
                        className="flex w-full items-center justify-center gap-x-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <PlusIcon className="size-5" />
                        Nuevo post
                    </button>
                </div>

                <div className="mt-auto pt-4">
                    {user ? (
                        <a
                            href="#"
                            className="flex items-center gap-x-3 rounded-full px-3 py-3 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
                        >
                            {user.avatar_url ? (
                                <img
                                    alt=""
                                    src={user.avatar_url}
                                    className="size-10 rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                                />
                            ) : (
                                <span className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 outline -outline-offset-1 outline-black/5 dark:bg-indigo-900 dark:text-indigo-300 dark:outline-white/10">
                                    {user.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                        </a>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="flex items-center gap-x-3 rounded-full px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                        >
                            Iniciar sesión
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    )
}
