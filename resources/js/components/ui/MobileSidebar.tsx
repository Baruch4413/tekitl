import { useEffect, useRef } from 'react';
import { ElDialog, ElDialogBackdrop, ElDialogPanel } from '@tailwindplus/elements/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import WelcomeSidebar from '@/components/ui/WelcomeSidebar';

interface MobileSidebarProps {
    open: boolean;
    onClose: () => void;
    currentPage: string;
}

export default function MobileSidebar({ open, onClose, currentPage }: MobileSidebarProps) {
    const ref = useRef<HTMLElement>(null);

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

        const handleClose = () => onClose();

        el.addEventListener('close', handleClose);
        el.addEventListener('cancel', handleClose);
        return () => {
            el.removeEventListener('close', handleClose);
            el.removeEventListener('cancel', handleClose);
        };
    }, [onClose]);

    return (
        <ElDialog ref={ref} className="relative z-50 xl:hidden">
            <dialog>
                <ElDialogBackdrop className="fixed inset-0 bg-gray-950/80 transition-opacity duration-300 ease-linear data-closed:opacity-0" />
                <div className="fixed inset-0 flex">
                    <ElDialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full">
                        <div className="absolute top-0 left-full flex w-16 justify-center pt-5 transition-opacity duration-300 ease-in-out data-closed:opacity-0">
                            <button type="button" command="close" className="-m-2.5 p-2.5">
                                <span className="sr-only">Cerrar menú</span>
                                <XMarkIcon aria-hidden className="size-6 text-white" />
                            </button>
                        </div>
                        <WelcomeSidebar currentPage={currentPage} />
                    </ElDialogPanel>
                </div>
            </dialog>
        </ElDialog>
    );
}
