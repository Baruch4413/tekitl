import type { Auth } from '@/types/auth';

export type TranslationDictionary = {
    [key: string]: string | TranslationDictionary;
};

export type TranslationsPayload = Record<string, TranslationDictionary>;

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            locale: string;
            translations: TranslationsPayload;
            [key: string]: unknown;
        };
    }
}
