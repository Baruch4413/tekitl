import { cn } from '@/lib/utils'

const stops = [
    { value: 0, label: 'Menos de 1 año' },
    { value: 1, label: 'Más de un año' },
    { value: 3, label: 'Más de 3 años' },
    { value: 5, label: 'Más de 5 años' },
    { value: 10, label: 'Más de 10 años' },
]

interface ExperienceSliderProps {
    value: number
    onChange: (value: number) => void
}

export default function ExperienceSlider({ value, onChange }: ExperienceSliderProps) {
    const activeIndex = stops.findIndex((s) => s.value === value)

    return (
        <div className="space-y-3">
            <div className="relative flex items-center justify-between">
                {/* Track line */}
                <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-gray-200 dark:bg-white/10" />
                <div
                    className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-indigo-500 transition-all"
                    style={{ width: `${(activeIndex / (stops.length - 1)) * 100}%` }}
                />

                {stops.map((stop, index) => (
                    <button
                        key={stop.value}
                        type="button"
                        onClick={() => onChange(stop.value)}
                        className={cn(
                            'relative z-10 size-4 rounded-full border-2 transition-colors',
                            index <= activeIndex
                                ? 'border-indigo-500 bg-indigo-500'
                                : 'border-gray-300 bg-white dark:border-white/20 dark:bg-gray-900',
                        )}
                    >
                        <span className="sr-only">{stop.label}</span>
                    </button>
                ))}
            </div>
            <p className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                {stops[activeIndex]?.label ?? stops[0].label}
            </p>
        </div>
    )
}
