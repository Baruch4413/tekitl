import { useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { store as transitionStage } from '@/actions/App/Http/Controllers/ProjectStageController'
import type { ProjectStageValue } from './ProjectStageBadge'

export interface AllowedTransition {
    to: ProjectStageValue
    label: string
    isTerminal: boolean
}

interface ProjectStageActionsProps {
    projectId: number
    allowedTransitions: AllowedTransition[]
}

const transitionLabels: Record<ProjectStageValue, string> = {
    planning: 'Volver a planificación',
    in_execution: 'Iniciar proyecto',
    completed: 'Completar proyecto',
    aborted: 'Abortar proyecto',
}

const terminalConsequences: Partial<Record<ProjectStageValue, string>> = {
    completed: 'Una vez completado, no podrás cambiar la etapa después. Cualquier solicitud pendiente será rechazada automáticamente.',
    aborted: 'Una vez abortado, no podrás cambiar la etapa después. Cualquier solicitud pendiente será rechazada automáticamente.',
}

export default function ProjectStageActions({ projectId, allowedTransitions }: ProjectStageActionsProps) {
    const [pendingTerminal, setPendingTerminal] = useState<AllowedTransition | null>(null)
    const [submitting, setSubmitting] = useState(false)

    if (allowedTransitions.length === 0) {
        return null
    }

    const submit = (to: ProjectStageValue, onDone?: () => void) => {
        setSubmitting(true)
        router.post(
            transitionStage.url(projectId),
            { to },
            {
                preserveScroll: true,
                onError: (errors) => {
                    Object.values(errors).forEach((msg) => toast.error(msg))
                },
                onFinish: () => {
                    setSubmitting(false)
                    onDone?.()
                },
            },
        )
    }

    const handleClick = (transition: AllowedTransition) => {
        if (transition.isTerminal) {
            setPendingTerminal(transition)
            return
        }
        submit(transition.to)
    }

    const confirmTerminal = () => {
        if (!pendingTerminal) return
        submit(pendingTerminal.to, () => setPendingTerminal(null))
    }

    return (
        <>
            <div className="mt-4 flex flex-wrap gap-2">
                {allowedTransitions.map((transition) => (
                    <Button
                        key={transition.to}
                        type="button"
                        variant={transition.isTerminal ? 'destructive' : 'default'}
                        size="sm"
                        disabled={submitting}
                        onClick={() => handleClick(transition)}
                    >
                        {transitionLabels[transition.to] ?? transition.label}
                    </Button>
                ))}
            </div>

            <Dialog open={pendingTerminal !== null} onOpenChange={(open) => !open && setPendingTerminal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            ¿Confirmar transición a {pendingTerminal?.label.toLowerCase()}?
                        </DialogTitle>
                        <DialogDescription>
                            {pendingTerminal ? terminalConsequences[pendingTerminal.to] : null}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPendingTerminal(null)}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmTerminal}
                            disabled={submitting}
                        >
                            {pendingTerminal?.to === 'completed' ? 'Confirmar y completar' : 'Confirmar y abortar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
