import SettingsRow from '@/components/ui/settings/SettingsRow'
import SettingsSection from '@/components/ui/settings/SettingsSection'
import ToggleSwitch from '@/components/ui/toggle-switch'
import { t } from '@/lib/i18n'

export default function PrivacySection() {
    return (
        <div className="space-y-10">
            <SettingsSection
                title={t('settings.privacidad.visibility.title')}
                description={t('settings.privacidad.visibility.description')}
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <ToggleSwitch
                        label={t('settings.privacidad.private_account.label')}
                        description={t('settings.privacidad.private_account.description')}
                    />
                    <ToggleSwitch
                        label={t('settings.privacidad.show_email.label')}
                        description={t('settings.privacidad.show_email.description')}
                    />
                    <ToggleSwitch
                        label={t('settings.privacidad.allow_dms.label')}
                        description={t('settings.privacidad.allow_dms.description')}
                        defaultChecked
                    />
                </dl>
            </SettingsSection>

            <SettingsSection
                title={t('settings.privacidad.data.title')}
                description={t('settings.privacidad.data.description')}
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <SettingsRow
                        label={t('settings.privacidad.download.label')}
                        value={t('settings.privacidad.download.value')}
                        onEdit={() => {}}
                        editLabel={t('settings.privacidad.download.edit_label')}
                    />
                    <SettingsRow
                        label={t('settings.privacidad.delete.label')}
                        value={t('settings.privacidad.delete.value')}
                        onEdit={() => {}}
                        editLabel={t('settings.privacidad.delete.edit_label')}
                    />
                </dl>
            </SettingsSection>
        </div>
    )
}
