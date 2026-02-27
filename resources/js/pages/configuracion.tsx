'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Bars3Icon } from '@heroicons/react/20/solid'
import WelcomeSidebar from '@/components/ui/WelcomeSidebar'
import SettingsNav, { type SettingsSection } from '@/components/ui/settings/SettingsNav'
import PerfilSection from '@/components/ui/settings/PerfilSection'
import SeguridadSection from '@/components/ui/settings/SeguridadSection'
import NotificacionesSection from '@/components/ui/settings/NotificacionesSection'
import PrivacidadSection from '@/components/ui/settings/PrivacidadSection'

export default function Configuracion() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeSection, setActiveSection] = useState<SettingsSection>('perfil')

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            {/* Mobile sidebar */}
            <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 xl:hidden">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-950/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                />
                <div className="fixed inset-0 flex">
                    <DialogPanel
                        transition
                        className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full"
                    >
                        <TransitionChild>
                            <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                                    <span className="sr-only">Cerrar menú</span>
                                    <XMarkIcon aria-hidden className="size-6 text-white" />
                                </button>
                            </div>
                        </TransitionChild>
                        <WelcomeSidebar currentPage="configuracion" />
                    </DialogPanel>
                </div>
            </Dialog>

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
                        <span className="sr-only">Abrir menú</span>
                        <Bars3Icon aria-hidden className="size-5" />
                    </button>
                    <div className="flex-1 text-center">
                        <h1 className="text-base font-bold text-gray-900 dark:text-white">Configuración</h1>
                    </div>
                </div>

                {/* Desktop sticky header */}
                <div className="sticky top-0 z-40 hidden border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-white/5 dark:bg-gray-950/80 xl:block">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configuración</h1>
                </div>

                {/* Settings content */}
                <h2 className="sr-only">Configuración de la cuenta</h2>

                <SettingsNav activeSection={activeSection} onSectionChange={setActiveSection} />

                <main className="px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20">
                        {activeSection === 'perfil' && <PerfilSection />}
                        {activeSection === 'seguridad' && <SeguridadSection />}
                        {activeSection === 'notificaciones' && <NotificacionesSection />}
                        {activeSection === 'privacidad' && <PrivacidadSection />}
                    </div>
                </main>
            </div>
        </div>
    )
}
