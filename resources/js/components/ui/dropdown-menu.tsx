import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { ElDropdown, ElMenu } from '@tailwindplus/elements/react';

import { cn } from '@/lib/utils';

function DropdownMenu({
    children,
    ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
    return (
        <ElDropdown data-slot="dropdown-menu" {...props}>
            {children}
        </ElDropdown>
    );
}

function DropdownMenuTrigger({
    children,
    className,
    asChild = false,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            type="button"
            data-slot="dropdown-menu-trigger"
            className={className}
            {...props}
        >
            {children}
        </Comp>
    );
}

function DropdownMenuContent({
    className,
    align = 'start',
    side = 'bottom',
    sideOffset = 4,
    children,
    ...props
}: React.HTMLAttributes<HTMLElement> & {
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    sideOffset?: number;
    children?: React.ReactNode;
}) {
    const anchor = `${side} ${align}`;

    return (
        <ElMenu
            data-slot="dropdown-menu-content"
            // @ts-expect-error — web component attributes
            popover=""
            anchor={anchor}
            className={cn(
                'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-md transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0',
                className,
            )}
            style={{ '--anchor-gap': `${sideOffset}px` } as React.CSSProperties}
            {...props}
        >
            {children}
        </ElMenu>
    );
}

function DropdownMenuGroup({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="dropdown-menu-group"
            role="group"
            className={className}
            {...props}
        />
    );
}

function DropdownMenuItem({
    className,
    inset,
    variant = 'default',
    asChild = false,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    inset?: boolean;
    variant?: 'default' | 'destructive';
    asChild?: boolean;
}) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            type="button"
            data-slot="dropdown-menu-item"
            data-inset={inset || undefined}
            data-variant={variant}
            className={cn(
                'focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/40 data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground [&_svg:not([class*=\'text-\'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
                className,
            )}
            {...props}
        >
            {children}
        </Comp>
    );
}

function DropdownMenuLabel({
    className,
    inset,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean;
}) {
    return (
        <div
            data-slot="dropdown-menu-label"
            data-inset={inset || undefined}
            className={cn(
                'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
                className,
            )}
            {...props}
        />
    );
}

function DropdownMenuSeparator({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            data-slot="dropdown-menu-separator"
            role="separator"
            className={cn('bg-border -mx-1 my-1 h-px', className)}
            {...props}
        />
    );
}

function DropdownMenuShortcut({
    className,
    ...props
}: React.ComponentProps<'span'>) {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            className={cn(
                'text-muted-foreground ml-auto text-xs tracking-widest',
                className,
            )}
            {...props}
        />
    );
}

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
};
