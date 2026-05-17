'use client'

import { Bars3Icon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import MobileSidebar from '@/components/ui/MobileSidebar'
import NotificationsSection from '@/components/ui/settings/NotificationsSection'
import PrivacySection from '@/components/ui/settings/PrivacySection'
import ProfileSection from '@/components/ui/settings/ProfileSection'
import SecuritySection from '@/components/ui/settings/SecuritySection'
import SettingsNav, { type SettingsSection } from '@/components/ui/settings/SettingsNav'
import WelcomeSidebar from '@/components/ui/WelcomeSidebar'
import { t } from '@/lib/i18n'

export default function Configuracion() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeSection, setActiveSection] = useState<SettingsSection>('perfil')

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Mobile sidebar */}
            <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} currentPage="configuracion" />

            {/* Desktop fixed sidebar */}
            <div className="hidden xl:fixed xl:inset-y-0 xl:left-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
                <WelcomeSidebar currentPage="configuracion" />
            </div>

            {/* Main content */}
            <div className="xl:pl-72">
                {/* Mobile top bar */}
                <div className="sticky top-0 z-40 flex h-14 items-center gap-x-4 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-sm dark:border-white/5 dark:bg-gray-950/80 xl:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
                    >
                        <span className="sr-only">{t('settings.configuracion.a11y.open_menu')}</span>
                        <Bars3Icon aria-hidden className="size-5" />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-base font-bold text-gray-900 dark:text-white">{t('settings.configuracion.heading')}</h1>
                    </div>
                </div>

                {/* Desktop sticky header */}
                <div className="sticky top-0 z-40 hidden border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-white/5 dark:bg-gray-950/80 xl:block">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('settings.configuracion.heading')}</h1>
                </div>

                {/* Settings content */}
                <h2 className="sr-only">{t('settings.configuracion.a11y.account_settings')}</h2>

                <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />

                <main className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20">
                        {activeSection === 'perfil' && <ProfileSection />}
                        {activeSection === 'seguridad' && <SecuritySection />}
                        {activeSection === 'notificaciones' && <NotificationsSection />}
                        {activeSection === 'privacidad' && <PrivacySection />}
                    </div>
                </main>
            </div>
        </div>
    )
}
