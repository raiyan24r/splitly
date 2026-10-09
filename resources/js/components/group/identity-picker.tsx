import { router } from '@inertiajs/react';
import { ArrowRight, Check, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import GroupController from '@/actions/App/Http/Controllers/GroupController';
import MemberController from '@/actions/App/Http/Controllers/MemberController';
import { useGroup } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * "Who are you?" — remembered in this browser only, so there is no login.
 */
export function IdentityPicker({
    open,
    onOpenChange,
    dismissible,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dismissible: boolean;
}) {
    const { group, activeMembers, me, setMe, readOnly } = useGroup();
    const [name, setName] = useState('');
    const [error, setError] = useState<string>();
    const [processing, setProcessing] = useState(false);

    const finish = (id: number) => {
        setMe(id);
        onOpenChange(false);
    };

    // Tell the server first (the request still carries the previous identity),
    // so the audit log shows who switched to whom; then remember it locally.
    const choose = (id: number) => {
        if (id === me?.id) {
            onOpenChange(false);

            return;
        }

        // The choice is local; recording it is best effort. If the request
        // fails for a reason other than validation, still switch.
        const switchAnyway = () => {
            finish(id);
            toast.warning(
                "Switched, but it couldn't be recorded in the activity log.",
            );

            return false;
        };

        router.post(
            GroupController.identify.url(group.slug),
            { member_id: id },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onSuccess: () => finish(id),
                onHttpException: switchAnyway,
                onNetworkError: switchAnyway,
            },
        );
    };

    const join = (event: React.FormEvent) => {
        event.preventDefault();

        if (!name.trim()) {
            return;
        }

        router.post(
            MemberController.store.url(group.slug),
            { name, join: true },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onError: (errors) => setError(errors.name),
                onSuccess: (page) => {
                    const created = page.flash?.member as
                        | { id: number }
                        | undefined;

                    if (!created) {
                        return;
                    }

                    setName('');
                    setError(undefined);

                    // A first-time joiner is already logged as "joined";
                    // someone switching away from another name is a switch.
                    if (me) {
                        choose(created.id);
                    } else {
                        finish(created.id);
                    }
                },
            },
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(value) =>
                (dismissible || value) && onOpenChange(value)
            }
        >
            <DialogContent
                className="max-w-md gap-6 rounded-2xl"
                onInteractOutside={(e) => !dismissible && e.preventDefault()}
                onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle className="text-xl">Who are you?</DialogTitle>
                    <DialogDescription>
                        Tap your name. We'll remember it on this device so
                        everyone can see who added what.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid max-h-[45vh] grid-cols-2 gap-2 overflow-y-auto pr-1">
                    {activeMembers.map((member) => (
                        <button
                            key={member.id}
                            type="button"
                            disabled={processing}
                            onClick={() => choose(member.id)}
                            className={cn(
                                'group flex items-center gap-3 rounded-xl border bg-white/2 p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5',
                                me?.id === member.id &&
                                    'border-primary/60 bg-primary/10',
                            )}
                        >
                            <MemberAvatar member={member} size="md" />
                            <span className="min-w-0 flex-1 truncate font-medium">
                                {member.name}
                            </span>
                            {me?.id === member.id ? (
                                <Check className="size-4 text-primary" />
                            ) : (
                                <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            )}
                        </button>
                    ))}
                </div>

                {!readOnly && (
                    <form onSubmit={join} className="space-y-2">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Not on the list?
                        </p>
                        <div className="flex gap-2">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                maxLength={60}
                                className="h-10"
                            />
                            <Button
                                type="submit"
                                className="h-10"
                                disabled={processing || !name.trim()}
                            >
                                <UserPlus />
                                Join
                            </Button>
                        </div>
                        <InputError message={error} />
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
