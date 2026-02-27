import {
    UserCircleIcon,
    FingerPrintIcon,
    BellIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline'

export type SettingsSection = 'perfil' | 'seguridad' | 'notificaciones' | 'privacidad'

interface NavItem {
    id: SettingsSection
    label: string
    icon: React.FC<React.SVGProps<SVGSVGElement>>
}

const navItems: NavItem[] = [
    { id: 'perfil', label: 'Perfil', icon: UserCircleIcon },
    { id: 'seguridad', label: 'Seguridad', icon: FingerPrintIcon },
    { id: 'notificaciones', label: 'Notificaciones', icon: BellIcon },
    { id: 'privacidad', label: 'Privacidad', icon: ShieldCheckIcon },
]

function classNames(...classes: (string | false | null | undefined)[]) {
    return classes.filter(Boolean).join(' ')
}

interface SettingsNavProps {
    activeSection: SettingsSection
    onSectionChange: (section: SettingsSection) => void
}

export default function SettingsNav({ activeSection, onSectionChange }: SettingsNavProps) {
    return (
        <div className="border-b border-gray-200 dark:border-white/10">
            <nav className="flex overflow-x-auto">
                <ul role="list" className="flex min-w-full flex-none gap-x-1 px-4 sm:px-6 lg:px-8">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => onSectionChange(item.id)}
                                className={classNames(
                                    item.id === activeSection
                                        ? 'border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                                    'flex items-center gap-x-2 whitespace-nowrap px-1 py-4 text-sm font-semibold transition-colors',
                                )}
                            >
                                <item.icon aria-hidden className="size-4 shrink-0" />
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    )
}
