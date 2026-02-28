import SettingsSection from '@/components/ui/settings/SettingsSection'
import ToggleSwitch from '@/components/ui/toggle-switch'

export default function NotificacionesSection() {
    return (
        <SettingsSection
            title="Notificaciones"
            description="Elige cómo y cuándo quieres recibir notificaciones."
        >
            <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                <ToggleSwitch
                    label="Nuevos seguidores"
                    description="Recibe una notificación cuando alguien empieza a seguirte."
                    defaultChecked
                />
                <ToggleSwitch
                    label="Menciones"
                    description="Recibe una notificación cuando alguien te menciona en un post."
                    defaultChecked
                />
                <ToggleSwitch
                    label="Comentarios"
                    description="Recibe una notificación cuando alguien comenta en tus posts."
                    defaultChecked
                />
                <ToggleSwitch
                    label="Me gusta"
                    description="Recibe una notificación cuando alguien le da me gusta a tus posts."
                />
                <ToggleSwitch
                    label="Actualizaciones de la plataforma"
                    description="Entérate de nuevas funciones y mejoras de Tekitl."
                />
            </dl>
        </SettingsSection>
    )
}
