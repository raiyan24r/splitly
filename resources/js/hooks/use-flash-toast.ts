import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            const undo = data.undo;

            toast[data.type](data.message, {
                action: undo
                    ? {
                          label: 'Undo',
                          onClick: () =>
                              router.post(undo, {}, { preserveScroll: true }),
                      }
                    : undefined,
            });
        });
    }, []);
}
