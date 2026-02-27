import SettingsSection from '@/components/ui/settings/SettingsSection'

interface NotifToggleProps {
    label: string
    description: string
    defaultChecked?: boolean
}

function NotifToggle({ label, description, defaultChecked = false }: NotifToggleProps) {
    return (
        <div className="flex pt-6 pb-6">
            <dt className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </dt>
            <dd className="ml-6 flex shrink-0 items-start">
                <div className="group relative inline-flex w-8 shrink-0 rounded-full bg-gray-200 p-px inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
                    <span className="size-4 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-3.5" />
                    <input
                        defaultChecked={defaultChecked}
                        type="checkbox"
                        aria-label={label}
                        className="absolute inset-0 size-full appearance-none focus:outline-hidden"
                    />
                </div>
            </dd>
        </div>
    )
}

export default function NotificacionesSection() {
    return (
        <SettingsSection
            title="Notificaciones"
            description="Elige cómo y cuándo quieres recibir notificaciones."
        >
            <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                <NotifToggle
                    label="Nuevos seguidores"
                    description="Recibe una notificación cuando alguien empieza a seguirte."
                    defaultChecked
                />
                <NotifToggle
                    label="Menciones"
                    description="Recibe una notificación cuando alguien te menciona en un post."
                    defaultChecked
                />
                <NotifToggle
                    label="Comentarios"
                    description="Recibe una notificación cuando alguien comenta en tus posts."
                    defaultChecked
                />
                <NotifToggle
                    label="Me gusta"
                    description="Recibe una notificación cuando alguien le da me gusta a tus posts."
                />
                <NotifToggle
                    label="Actualizaciones de la plataforma"
                    description="Entérate de nuevas funciones y mejoras de Tekitl."
                />
            </dl>
        </SettingsSection>
    )
}
