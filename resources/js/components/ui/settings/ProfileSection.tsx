import { usePage } from '@inertiajs/react'
import AvatarUpload from '@/components/ui/settings/AvatarUpload'
import SettingsRow from '@/components/ui/settings/SettingsRow'
import SettingsSection from '@/components/ui/settings/SettingsSection'
import { t } from '@/lib/i18n'
import type { Auth } from '@/types/auth'

export default function ProfileSection() {
    const { auth } = usePage<{ auth: Auth }>().props
    const user = auth.user

    return (
        <div className="space-y-10">
            <SettingsSection
                title={t('settings.perfil.photo.title')}
                description={t('settings.perfil.photo.description')}
            >
                <div className="mt-6">
                    <AvatarUpload imageUrl={user.avatar_url ?? null} name={user.name} />
                </div>
            </SettingsSection>

            <SettingsSection
                title={t('settings.perfil.personal.title')}
                description={t('settings.perfil.personal.description')}
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <SettingsRow
                        label={t('settings.perfil.fields.name')}
                        value={user.name}
                        onEdit={() => {}}
                    />
                    <SettingsRow
                        label={t('settings.perfil.fields.email')}
                        value={user.email}
                        onEdit={() => {}}
                    />
                    <SettingsRow
                        label={t('settings.perfil.fields.username')}
                        value={`@${user.name.toLowerCase().replace(/\s+/g, '')}`}
                        onEdit={() => {}}
                    />
                    <SettingsRow
                        label={t('settings.perfil.fields.description')}
                        value={t('settings.perfil.fields.description_placeholder')}
                        onEdit={() => {}}
                    />
                </dl>
            </SettingsSection>
        </div>
    )
}
