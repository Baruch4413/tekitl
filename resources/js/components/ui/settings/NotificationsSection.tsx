import SettingsSection from '@/components/ui/settings/SettingsSection'
import ToggleSwitch from '@/components/ui/toggle-switch'
import { t } from '@/lib/i18n'

export default function NotificationsSection() {
    return (
        <SettingsSection
            title={t('settings.notificaciones.title')}
            description={t('settings.notificaciones.description')}
        >
            <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                <ToggleSwitch
                    label={t('settings.notificaciones.followers.label')}
                    description={t('settings.notificaciones.followers.description')}
                    defaultChecked
                />
                <ToggleSwitch
                    label={t('settings.notificaciones.mentions.label')}
                    description={t('settings.notificaciones.mentions.description')}
                    defaultChecked
                />
                <ToggleSwitch
                    label={t('settings.notificaciones.comments.label')}
                    description={t('settings.notificaciones.comments.description')}
                    defaultChecked
                />
                <ToggleSwitch
                    label={t('settings.notificaciones.likes.label')}
                    description={t('settings.notificaciones.likes.description')}
                />
                <ToggleSwitch
                    label={t('settings.notificaciones.updates.label')}
                    description={t('settings.notificaciones.updates.description')}
                />
            </dl>
        </SettingsSection>
    )
}
