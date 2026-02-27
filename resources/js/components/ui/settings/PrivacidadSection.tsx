import SettingsSection from '@/components/ui/settings/SettingsSection'
import SettingsRow from '@/components/ui/settings/SettingsRow'

interface PrivacyToggleProps {
    label: string
    description: string
    defaultChecked?: boolean
}

function PrivacyToggle({ label, description, defaultChecked = false }: PrivacyToggleProps) {
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

export default function PrivacidadSection() {
    return (
        <div className="space-y-10">
            <SettingsSection
                title="Visibilidad de la cuenta"
                description="Controla quién puede ver tu perfil y tu contenido."
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <PrivacyToggle
                        label="Cuenta privada"
                        description="Solo tus seguidores aprobados podrán ver tus posts."
                    />
                    <PrivacyToggle
                        label="Mostrar correo electrónico en el perfil"
                        description="Tu correo será visible para otros usuarios."
                    />
                    <PrivacyToggle
                        label="Permitir mensajes directos"
                        description="Cualquier usuario puede enviarte mensajes directos."
                        defaultChecked
                    />
                </dl>
            </SettingsSection>

            <SettingsSection
                title="Datos y actividad"
                description="Gestiona cómo se usan tus datos en la plataforma."
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <SettingsRow
                        label="Descargar mis datos"
                        value="Solicita una copia de toda tu información"
                        onEdit={() => {}}
                        editLabel="Solicitar"
                    />
                    <SettingsRow
                        label="Eliminar cuenta"
                        value="Esta acción es permanente e irreversible"
                        onEdit={() => {}}
                        editLabel="Eliminar"
                    />
                </dl>
            </SettingsSection>
        </div>
    )
}
