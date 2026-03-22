import { Slot } from '@radix-ui/react-slot';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { createContext, useContext, useEffect, useId, useRef } from 'react';
import { ElDialog, ElDialogBackdrop, ElDialogPanel } from '@tailwindplus/elements/react';

import { cn } from '@/lib/utils';

const DialogContext = createContext<string>('');

function Dialog({
    children,
    open,
    onOpenChange,
    ...props
}: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
} & Omit<React.HTMLAttributes<HTMLElement>, 'children'>) {
    const ref = useRef<HTMLElement>(null);
    const dialogId = useId();

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (open) {
            if (!el.hasAttribute('open')) {
                (el as any).show();
            }
        } else {
            if (el.hasAttribute('open')) {
                (el as any).hide();
            }
        }
    }, [open]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleClose = () => onOpenChange?.(false);

        el.addEventListener('close', handleClose);
        el.addEventListener('cancel', handleClose);
        return () => {
            el.removeEventListener('close', handleClose);
            el.removeEventListener('cancel', handleClose);
        };
    }, [onOpenChange]);

    return (
        <DialogContext.Provider value={dialogId}>
            <ElDialog ref={ref} id={dialogId} data-slot="dialog" {...props}>
                {children}
            </ElDialog>
        </DialogContext.Provider>
    );
}

function DialogTrigger({
    children,
    className,
    asChild = false,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
}) {
    const dialogId = useContext(DialogContext);
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            type="button"
            data-slot="dialog-trigger"
            command="show-modal"
            commandfor={dialogId}
            className={className}
            {...props}
        >
            {children}
        </Comp>
    );
}

function DialogOverlay({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    return (
        <ElDialogBackdrop
            data-slot="dialog-overlay"
            className={cn(
                'fixed inset-0 z-50 bg-black/80 transition-opacity duration-200 ease-out data-closed:opacity-0',
                className,
            )}
            {...props}
        />
    );
}

function DialogContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
    return (
        <dialog>
            <DialogOverlay />
            <ElDialogPanel
                data-slot="dialog-content"
                className={cn(
                    'bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-gray-200 p-6 shadow-lg transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0 dark:border-white/[0.06] sm:max-w-lg',
                    className,
                )}
                {...props}
            >
                {children}
                <button
                    type="button"
                    command="close"
                    className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                >
                    <XIcon />
                    <span className="sr-only">Close</span>
                </button>
            </ElDialogPanel>
        </dialog>
    );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-header"
            className={cn(
                'flex flex-col gap-2 text-center sm:text-left',
                className,
            )}
            {...props}
        />
    );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="dialog-footer"
            className={cn(
                'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
                className,
            )}
            {...props}
        />
    );
}

function DialogTitle({
    className,
    ...props
}: React.ComponentProps<'h2'>) {
    return (
        <h2
            data-slot="dialog-title"
            className={cn('text-lg leading-none font-semibold', className)}
            {...props}
        />
    );
}

function DialogDescription({
    className,
    ...props
}: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="dialog-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

function DialogClose({
    children,
    className,
    asChild = false,
    onClick,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            type="button"
            command="close"
            data-slot="dialog-close"
            className={className}
            onClick={onClick}
            {...props}
        >
            {children}
        </Comp>
    );
}

function DialogPortal({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
};
