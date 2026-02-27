import type { ReactNode } from 'react'

interface SettingsSectionProps {
    title: string
    description: string
    children: ReactNode
}

export default function SettingsSection({ title, description, children }: SettingsSectionProps) {
    return (
        <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm/6 text-gray-500 dark:text-gray-400">{description}</p>
            {children}
        </div>
    )
}
