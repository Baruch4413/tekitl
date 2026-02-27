interface SettingsRowProps {
    label: string
    value: string
    onEdit?: () => void
    editLabel?: string
}

export default function SettingsRow({ label, value, onEdit, editLabel = 'Actualizar' }: SettingsRowProps) {
    return (
        <div className="py-6 sm:flex">
            <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6 dark:text-white">{label}</dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                <div className="text-gray-900 dark:text-gray-300">{value}</div>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        {editLabel}
                    </button>
                )}
            </dd>
        </div>
    )
}
