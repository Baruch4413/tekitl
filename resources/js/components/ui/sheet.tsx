import { Slot } from '@radix-ui/react-slot';
import { XIcon } from 'lucide-react';
import * as React from 'react';
import { createContext, useContext, useEffect, useId, useRef } from 'react';
import { ElDialog, ElDialogBackdrop, ElDialogPanel } from '@tailwindplus/elements/react';

import { cn } from '@/lib/utils';

type ShowHideElement = HTMLElement & { show(): void; hide(): void };

const SheetContext = createContext<string>('');

function Sheet({
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
    const sheetId = useId();

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (open) {
            if (!el.hasAttribute('open')) {
                (el as ShowHideElement).show();
            }
        } else {
            if (el.hasAttribute('open')) {
                (el as ShowHideElement).hide();
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
        <SheetContext.Provider value={sheetId}>
            <ElDialog ref={ref} id={sheetId} data-slot="sheet" {...props}>
                {children}
            </ElDialog>
        </SheetContext.Provider>
    );
}

function SheetTrigger({
    children,
    className,
    asChild = false,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
}) {
    const sheetId = useContext(SheetContext);
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            type="button"
            data-slot="sheet-trigger"
            command="show-modal"
            commandfor={sheetId}
            className={className}
            {...props}
        >
            {children}
        </Comp>
    );
}

function SheetClose({
    children,
    className,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            type="button"
            command="close"
            data-slot="sheet-close"
            className={className}
            {...props}
        >
            {children}
        </button>
    );
}

const sheetSideClasses = {
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-closed:translate-x-full',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm data-closed:-translate-x-full',
    top: 'inset-x-0 top-0 h-auto border-b data-closed:-translate-y-full',
    bottom: 'inset-x-0 bottom-0 h-auto border-t data-closed:translate-y-full',
};

function SheetContent({
    className,
    children,
    side = 'right',
    ...props
}: React.HTMLAttributes<HTMLElement> & {
    side?: 'top' | 'right' | 'bottom' | 'left';
    children?: React.ReactNode;
}) {
    return (
        <dialog>
            <ElDialogBackdrop
                data-slot="sheet-overlay"
                className="fixed inset-0 z-50 bg-black/80 transition-opacity duration-300 ease-in-out data-closed:opacity-0"
            />
            <ElDialogPanel
                data-slot="sheet-content"
                className={cn(
                    'bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out duration-300',
                    sheetSideClasses[side],
                    className,
                )}
                {...props}
            >
                {children}
                <button
                    type="button"
                    command="close"
                    className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
                >
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                </button>
            </ElDialogPanel>
        </dialog>
    );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-header"
            className={cn('flex flex-col gap-1.5 p-4', className)}
            {...props}
        />
    );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="sheet-footer"
            className={cn('mt-auto flex flex-col gap-2 p-4', className)}
            {...props}
        />
    );
}

function SheetTitle({
    className,
    ...props
}: React.ComponentProps<'h2'>) {
    return (
        <h2
            data-slot="sheet-title"
            className={cn('text-foreground font-semibold', className)}
            {...props}
        />
    );
}

function SheetDescription({
    className,
    ...props
}: React.ComponentProps<'p'>) {
    return (
        <p
            data-slot="sheet-description"
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    );
}

export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
};
