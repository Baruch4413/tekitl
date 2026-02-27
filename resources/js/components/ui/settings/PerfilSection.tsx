import { usePage } from '@inertiajs/react'
import type { Auth } from '@/types/auth'
import AvatarUpload from '@/components/ui/settings/AvatarUpload'
import SettingsSection from '@/components/ui/settings/SettingsSection'
import SettingsRow from '@/components/ui/settings/SettingsRow'

export default function PerfilSection() {
    const { auth } = usePage<{ auth: Auth }>().props
    const user = auth.user

    return (
        <div className="space-y-10">
            <SettingsSection
                title="Foto de perfil"
                description="Esta imagen será visible públicamente en tu perfil."
            >
                <div className="mt-6">
                    <AvatarUpload imageUrl={user.avatar_url ?? null} name={user.name} />
                </div>
            </SettingsSection>

            <SettingsSection
                title="Información personal"
                description="Esta información será visible públicamente en tu perfil."
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <SettingsRow
                        label="Nombre completo"
                        value={user.name}
                        onEdit={() => {}}
                    />
                    <SettingsRow
                        label="Correo electrónico"
                        value={user.email}
                        onEdit={() => {}}
                    />
                    <SettingsRow
                        label="Nombre de usuario"
                        value={`@${user.name.toLowerCase().replace(/\s+/g, '')}`}
                        onEdit={() => {}}
                    />
                    <SettingsRow
                        label="Descripción"
                        value="Cuéntanos sobre ti..."
                        onEdit={() => {}}
                    />
                </dl>
            </SettingsSection>
        </div>
    )
}
