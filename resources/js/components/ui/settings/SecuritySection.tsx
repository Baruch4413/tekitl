import SettingsRow from '@/components/ui/settings/SettingsRow'
import SettingsSection from '@/components/ui/settings/SettingsSection'
import { t } from '@/lib/i18n'

export default function SecuritySection() {
    return (
        <div className="space-y-10">
            <SettingsSection
                title={t('settings.seguridad.password.title')}
                description={t('settings.seguridad.password.description')}
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <SettingsRow
                        label={t('settings.seguridad.password.label')}
                        value="••••••••"
                        onEdit={() => {}}
                        editLabel={t('settings.seguridad.password.edit_label')}
                    />
                </dl>
            </SettingsSection>

            <SettingsSection
                title={t('settings.seguridad.sessions.title')}
                description={t('settings.seguridad.sessions.description')}
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <div className="py-6">
                        <button
                            type="button"
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 dark:bg-red-500 dark:shadow-none dark:hover:bg-red-400"
                        >
                            {t('settings.seguridad.sessions.logout_button')}
                        </button>
                    </div>
                </dl>
            </SettingsSection>
        </div>
    )
}
