import { Head, Link, useForm } from '@inertiajs/react';
import {
    Archive,
    Check,
    Copy,
    ExternalLink,
    Plus,
    Settings2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import AdminGroupController from '@/actions/App/Http/Controllers/Admin/GroupController';
import { ChipInput } from '@/components/chip-input';
import { formatDateTime } from '@/components/group/time';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useClipboard } from '@/hooks/use-clipboard';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import { index } from '@/routes/admin/groups';

type GroupRow = {
    slug: string;
    name: string;
    currency: string;
    exponent: number;
    members_count: number;
    expenses_count: number;
    total_spent: number;
    last_activity: string | null;
    archived: boolean;
    url: string;
    created_at: string;
};

export default function AdminGroups({
    groups,
    currencies,
}: {
    groups: GroupRow[];
    currencies: string[];
}) {
    const [creating, setCreating] = useState(false);
    const [copied, copy] = useClipboard();

    return (
        <>
            <Head title="Groups" />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Groups"
                        description="Create a group, then share its link and password."
                    />
                    <Button onClick={() => setCreating(true)}>
                        <Plus /> New group
                    </Button>
                </div>

                {groups.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center">
                        <Users className="size-8 text-muted-foreground" />
                        <div className="font-medium">No groups yet</div>
                        <p className="text-sm text-muted-foreground">
                            Create the first one to get started.
                        </p>
                        <Button
                            className="mt-2"
                            onClick={() => setCreating(true)}
                        >
                            <Plus /> New group
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                        {groups.map((g) => (
                            <div
                                key={g.slug}
                                className={cn(
                                    'flex flex-col gap-4 rounded-2xl border bg-card p-5',
                                    g.archived && 'opacity-60',
                                )}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="truncate font-semibold">
                                                {g.name}
                                            </h3>
                                            {g.archived && (
                                                <Archive className="size-3.5 text-amber-400" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {g.members_count} people ·{' '}
                                            {g.expenses_count} expenses
                                            {g.last_activity &&
                                                ` · last active ${formatDateTime(g.last_activity)}`}
                                        </p>
                                    </div>
                                    <div className="tabular shrink-0 text-right text-sm font-semibold">
                                        {formatMoney(
                                            g.total_spent,
                                            g.currency,
                                            g.exponent,
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 rounded-lg bg-white/3 px-3 py-2 font-mono text-xs text-muted-foreground">
                                    <span className="flex-1 truncate">
                                        {g.url}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => void copy(g.url)}
                                        className="hover:text-foreground"
                                        aria-label="Copy link"
                                    >
                                        {copied === g.url ? (
                                            <Check className="size-3.5 text-primary" />
                                        ) : (
                                            <Copy className="size-3.5" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        asChild
                                    >
                                        <Link
                                            href={AdminGroupController.show(
                                                g.slug,
                                            )}
                                        >
                                            <Settings2 /> Manage
                                        </Link>
                                    </Button>
                                    <Button size="sm" variant="ghost" asChild>
                                        <a
                                            href={g.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ExternalLink /> Open
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateGroupDialog
                open={creating}
                onOpenChange={setCreating}
                currencies={currencies}
            />
        </>
    );
}

function CreateGroupDialog({
    open,
    onOpenChange,
    currencies,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currencies: string[];
}) {
    const form = useForm({
        name: '',
        description: '',
        currency: 'AED',
        password: '',
        members: [] as string[],
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.submit(AdminGroupController.store(), {
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        });
    };

    const memberError = Object.entries(form.errors).find(([key]) =>
        key.startsWith('members'),
    )?.[1];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-2xl">
                <form onSubmit={submit} className="space-y-5">
                    <DialogHeader>
                        <DialogTitle>New group</DialogTitle>
                        <DialogDescription>
                            You'll get a private link to share with the group.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-[1fr_7rem] gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                autoFocus
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                placeholder="Goa trip 2026"
                            />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Currency</Label>
                            <Select
                                value={form.data.currency}
                                onValueChange={(v) =>
                                    form.setData('currency', v)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                    {currencies.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            Description{' '}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="description"
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                            placeholder="Flights, villa, food & fun"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Group password</Label>
                        <PasswordInput
                            id="password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            autoComplete="new-password"
                            placeholder="Something easy to share"
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label>People</Label>
                        <ChipInput
                            value={form.data.members}
                            onChange={(v) => form.setData('members', v)}
                            placeholder="Type a name, press Enter"
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional. People can also add themselves later.
                        </p>
                        <InputError message={memberError} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Create group
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

AdminGroups.layout = {
    breadcrumbs: [{ title: 'Groups', href: index() }],
};
