interface ToggleSwitchProps {
    label: string;
    description: string;
    defaultChecked?: boolean;
}

export default function ToggleSwitch({ label, description, defaultChecked = false }: ToggleSwitchProps) {
    return (
        <div className="flex pt-6 pb-6">
            <dt className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
            </dt>
            <dd className="ml-6 flex shrink-0 items-start">
                <div className="group relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full bg-gray-200 p-px inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2 dark:bg-white/5 dark:inset-ring-white/10 dark:outline-indigo-500 dark:has-checked:bg-indigo-500">
                    <span className="size-[18px] rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-4" />
                    <input
                        defaultChecked={defaultChecked}
                        type="checkbox"
                        aria-label={label}
                        className="absolute inset-0 size-full cursor-pointer appearance-none focus:outline-hidden"
                    />
                </div>
            </dd>
        </div>
    );
}
