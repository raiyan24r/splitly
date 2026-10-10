import { Copy, Download, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { renderBalanceSnapshot } from '@/components/group/balance-snapshot';
import { useGroup } from '@/components/group/group-context';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import type { Balances } from '@/types/group';

export function ShareBalancesDialog({
    open,
    onOpenChange,
    balances,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    balances: Balances;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle>Share balances</DialogTitle>
                    <DialogDescription>
                        A picture of who owes what, ready for the group chat.
                    </DialogDescription>
                </DialogHeader>
                {open && <Snapshot balances={balances} />}
            </DialogContent>
        </Dialog>
    );
}

function Snapshot({ balances }: { balances: Balances }) {
    const { group, members, money } = useGroup();
    const [image, setImage] = useState<{ file: File; url: string } | null>(
        null,
    );
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let url: string | null = null;
        let cancelled = false;

        renderBalanceSnapshot({
            group,
            members,
            balances,
            transfers: group.simplify_debts
                ? balances.simplified
                : balances.pairwise,
            money,
        })
            .then((blob) => {
                if (cancelled) {
                    return;
                }

                const date = new Date().toLocaleDateString('en-CA');
                const file = new File(
                    [blob],
                    `${group.slug}-balances-${date}.png`,
                    { type: 'image/png' },
                );
                url = URL.createObjectURL(file);
                setImage({ file, url });
            })
            .catch(() => !cancelled && setFailed(true));

        return () => {
            cancelled = true;

            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [group, members, balances, money]);

    if (failed) {
        return (
            <p className="text-sm text-owe">
                Could not create the picture in this browser.
            </p>
        );
    }

    if (!image) {
        return (
            <div className="flex h-48 items-center justify-center">
                <Spinner />
            </div>
        );
    }

    // Both need a secure page (HTTPS or localhost); downloading always works.
    const canShare =
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [image.file] });
    const canCopy =
        typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;

    const share = async () => {
        try {
            await navigator.share({
                files: [image.file],
                title: `${group.name} balances`,
            });
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                toast.error('Could not share the picture. Try downloading it.');
            }
        }
    };

    const copy = async () => {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': image.file }),
            ]);
            toast.success('Copied. Paste it in the group chat.');
        } catch {
            toast.error('Could not copy the picture. Try downloading it.');
        }
    };

    return (
        <div className="space-y-4">
            <div className="max-h-[55svh] overflow-y-auto rounded-xl border">
                <img
                    src={image.url}
                    alt={`${group.name} balances`}
                    className="w-full"
                />
            </div>

            <div className="flex flex-wrap justify-end gap-2">
                {canShare && (
                    <Button onClick={share}>
                        <Share2 /> Share
                    </Button>
                )}
                {canCopy && (
                    <Button
                        variant={canShare ? 'secondary' : 'default'}
                        onClick={copy}
                    >
                        <Copy /> Copy image
                    </Button>
                )}
                <Button
                    asChild
                    variant={canShare || canCopy ? 'secondary' : 'default'}
                >
                    <a href={image.url} download={image.file.name}>
                        <Download /> Download
                    </a>
                </Button>
            </div>

            {!canShare && !canCopy && (
                <p className="text-xs text-muted-foreground">
                    Download it, then attach it in the chat. One-tap sharing and
                    copying need the site to be on HTTPS.
                </p>
            )}
        </div>
    );
}
