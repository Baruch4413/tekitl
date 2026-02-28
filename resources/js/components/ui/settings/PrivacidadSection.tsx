import SettingsSection from '@/components/ui/settings/SettingsSection'
import SettingsRow from '@/components/ui/settings/SettingsRow'
import ToggleSwitch from '@/components/ui/toggle-switch'

export default function PrivacidadSection() {
    return (
        <div className="space-y-10">
            <SettingsSection
                title="Visibilidad de la cuenta"
                description="Controla quién puede ver tu perfil y tu contenido."
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <ToggleSwitch
                        label="Cuenta privada"
                        description="Solo tus seguidores aprobados podrán ver tus posts."
                    />
                    <ToggleSwitch
                        label="Mostrar correo electrónico en el perfil"
                        description="Tu correo será visible para otros usuarios."
                    />
                    <ToggleSwitch
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
