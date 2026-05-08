import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { t } from '@/lib/i18n';
import { edit as editAppearance } from '@/routes/appearance';
import type { BreadcrumbItem } from '@/types';

function useBreadcrumbs(): BreadcrumbItem[] {
    return [
        {
            title: t('settings.appearance.breadcrumb'),
            href: editAppearance().url,
        },
    ];
}

export default function Appearance() {
    const breadcrumbs = useBreadcrumbs();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.appearance.head_title')} />

            <h1 className="sr-only">{t('settings.appearance.a11y.heading')}</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title={t('settings.appearance.section.title')}
                        description={t('settings.appearance.section.description')}
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
