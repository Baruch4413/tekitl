import SettingsSection from '@/components/ui/settings/SettingsSection'
import SettingsRow from '@/components/ui/settings/SettingsRow'

export default function SeguridadSection() {
    return (
        <div className="space-y-10">
            <SettingsSection
                title="Contraseña"
                description="Actualiza la contraseña asociada a tu cuenta."
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <SettingsRow
                        label="Contraseña"
                        value="••••••••"
                        onEdit={() => {}}
                        editLabel="Cambiar"
                    />
                </dl>
            </SettingsSection>

            <SettingsSection
                title="Sesiones activas"
                description="Cierra sesión en todos los demás dispositivos donde hayas iniciado sesión."
            >
                <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-200 text-sm/6 dark:divide-white/5 dark:border-white/5">
                    <div className="py-6">
                        <button
                            type="button"
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 dark:bg-red-500 dark:shadow-none dark:hover:bg-red-400"
                        >
                            Cerrar otras sesiones
                        </button>
                    </div>
                </dl>
            </SettingsSection>
        </div>
    )
}
