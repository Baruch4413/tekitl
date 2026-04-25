import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { toast, Toaster } from 'sonner';
import LoginModal from '@/components/ui/LoginModal';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

router.on('navigate', (event) => {
    const flash = event.detail.page.props.flash as { success?: string; error?: string; loginRequired?: boolean } | undefined;
    if (flash?.loginRequired) {
        window.dispatchEvent(new CustomEvent('login-required'));
    }
    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <App {...props} />
                <LoginModal />
                <Toaster position="bottom-right" richColors />
            </StrictMode>,
        );
    },
    progress: {
        showSpinner: false,
    },
});

// This will set light / dark mode on load...
initializeTheme();
