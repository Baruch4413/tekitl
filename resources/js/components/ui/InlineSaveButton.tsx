import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface InlineSaveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode
}

export default function InlineSaveButton({ children = 'Guardar', className, ...props }: InlineSaveButtonProps) {
    return (
        <Button
            type="button"
            className={cn('h-9 shrink-0', className)}
            {...props}
        >
            {children}
        </Button>
    )
}
