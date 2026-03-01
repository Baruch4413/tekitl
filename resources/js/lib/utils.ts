import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatCount(count: number): string {
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(count % 1_000_000 === 0 ? 0 : 1)}M`
    }
    if (count >= 1_000) {
        return `${(count / 1_000).toFixed(count % 1_000 === 0 ? 0 : 1)}K`
    }
    return count.toString()
}
