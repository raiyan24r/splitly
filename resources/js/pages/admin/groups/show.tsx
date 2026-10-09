import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Archive,
    ArchiveRestore,
    Check,
    Copy,
    ExternalLink,
    RefreshCw,
    Trash2,
} from 'lucide-react';
import AdminGroupController from '@/actions/App/Http/Controllers/Admin/GroupController';
import { DeviceLine } from '@/components/device-line';
import { MemberAvatar } from '@/components/group/member-avatar';
import { formatDateTime } from '@/components/group/time';
import Heading from '@/components/heading';
import { When } from '@/components/when';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useClipboard } from '@/hooks/use-clipboard';
import { index as auditLogs } from '@/routes/admin/audit-logs';
import { index } from '@/routes/admin/groups';

type Props = {
    group: {
        slug: string;
        name: string;
        description: string | null;
        currency: string;
        archived: boolean;
        url: string;
        created_at: string;
        has_transactions: boolean;
    };
    members: { id: number; name: string; color: string }[];
    logs: {
        id: number;
        actor_name: string;
        actor_type: string;
        action: string;
        description: string;
        ip: string | null;
        device: string | null;
        device_id: string | null;
        device_tag: string | null;
        device_trail: string[];
        created_at: string;
    }[];
    currencies: string[];
};

export default function AdminGroupShow({
    group,
    members,
    logs,
    currencies,
}: Props) {
    const [copied, copy] = useClipboard();

    const details = useForm({
        name: group.name,
        description: group.description ?? '',
        currency: group.currency,
    });

    const password = useForm({ password: '' });

    const regenerate = () => {
        if (
            confirm(
                'Generate a new link? The current link will stop working immediately.',
            )
        ) {
            router.post(AdminGroupController.regenerateSlug.url(group.slug));
        }
    };

    const destroy = () => {
        if (confirm(`Delete "${group.name}"? Members will lose access.`)) {
            router.delete(AdminGroupController.destroy.url(group.slug));
        }
    };

    return (
        <>
            <Head title={group.name} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 sm:p-6">
                <Heading
                    title={group.name}
                    description={`Created ${formatDateTime(group.created_at)} · ${members.length} people`}
                />

                {/* Share */}
                <section className="space-y-4 rounded-2xl border bg-card p-5">
                    <div>
                        <h3 className="font-medium">Share</h3>
                        <p className="text-sm text-muted-foreground">
                            Send people this link together with the group
                            password.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-white/3 px-3 py-2.5 font-mono text-sm">
                        <span className="flex-1 truncate">{group.url}</span>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void copy(group.url)}
                        >
                            {copied ? <Check /> : <Copy />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="ghost" asChild>
                            <a
                                href={group.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <ExternalLink /> Open group
                            </a>
                        </Button>
                        <Button size="sm" variant="ghost" onClick={regenerate}>
                            <RefreshCw /> New link
                        </Button>
                    </div>
                </section>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Details */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            details.submit(
                                AdminGroupController.update(group.slug),
                                {
                                    preserveScroll: true,
                                },
                            );
                        }}
                        className="space-y-4 rounded-2xl border bg-card p-5"
                    >
                        <h3 className="font-medium">Details</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={details.data.name}
                                onChange={(e) =>
                                    details.setData('name', e.target.value)
                                }
                            />
                            <InputError message={details.errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={details.data.description}
                                onChange={(e) =>
                                    details.setData(
                                        'description',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Currency</Label>
                            <Select
                                value={details.data.currency}
                                onValueChange={(v) =>
                                    details.setData('currency', v)
                                }
                                disabled={group.has_transactions}
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
                            {group.has_transactions && (
                                <p className="text-xs text-muted-foreground">
                                    Locked because the group already has
                                    expenses.
                                </p>
                            )}
                            <InputError message={details.errors.currency} />
                        </div>
                        <Button
                            disabled={details.processing || !details.isDirty}
                        >
                            Save
                        </Button>
                    </form>

                    {/* Password + danger */}
                    <div className="space-y-6">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                password.submit(
                                    AdminGroupController.password(group.slug),
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => password.reset(),
                                    },
                                );
                            }}
                            className="space-y-4 rounded-2xl border bg-card p-5"
                        >
                            <div>
                                <h3 className="font-medium">Group password</h3>
                                <p className="text-sm text-muted-foreground">
                                    Changing it signs out every device.
                                </p>
                            </div>
                            <PasswordInput
                                value={password.data.password}
                                onChange={(e) =>
                                    password.setData('password', e.target.value)
                                }
                                autoComplete="new-password"
                                placeholder="New password"
                            />
                            <InputError message={password.errors.password} />
                            <Button
                                disabled={
                                    password.processing ||
                                    !password.data.password
                                }
                            >
                                Change password
                            </Button>
                        </form>

                        <div className="space-y-3 rounded-2xl border border-destructive/30 bg-card p-5">
                            <h3 className="font-medium">Danger zone</h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        router.post(
                                            AdminGroupController.archive.url(
                                                group.slug,
                                            ),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    {group.archived ? (
                                        <ArchiveRestore />
                                    ) : (
                                        <Archive />
                                    )}
                                    {group.archived
                                        ? 'Unarchive'
                                        : 'Archive (read-only)'}
                                </Button>
                                <Button variant="destructive" onClick={destroy}>
                                    <Trash2 /> Delete group
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* People */}
                <section className="space-y-3 rounded-2xl border bg-card p-5">
                    <h3 className="font-medium">People</h3>
                    {members.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Nobody yet. People can add themselves when they open
                            the link.
                        </p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {members.map((m) => (
                                <span
                                    key={m.id}
                                    className="flex items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm"
                                >
                                    <MemberAvatar member={m} size="sm" />
                                    {m.name}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* Recent activity */}
                <section className="space-y-3 rounded-2xl border bg-card p-5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium">Recent activity</h3>
                        <Link
                            href={auditLogs({ query: { group: group.slug } })}
                            className="text-sm text-primary hover:underline"
                        >
                            Full audit log →
                        </Link>
                    </div>
                    <ol className="divide-y">
                        {logs.map((log) => (
                            <li
                                key={log.id}
                                className="flex gap-3 py-2.5 text-sm"
                            >
                                <div className="min-w-0 flex-1">
                                    <span className="font-medium">
                                        {log.actor_name}
                                    </span>{' '}
                                    <span className="text-muted-foreground">
                                        {log.description}
                                    </span>
                                    <DeviceLine
                                        device={log.device}
                                        tag={log.device_tag}
                                        trail={log.device_trail}
                                        onTagClick={
                                            log.device_id
                                                ? () =>
                                                      router.visit(
                                                          auditLogs({
                                                              query: {
                                                                  device: log.device_id,
                                                              },
                                                          }),
                                                      )
                                                : undefined
                                        }
                                        className="mt-0.5"
                                    />
                                </div>
                                <div className="shrink-0 text-right text-xs text-muted-foreground">
                                    <When iso={log.created_at} />
                                    {log.ip && (
                                        <div className="font-mono text-[10px]">
                                            {log.ip}
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>
        </>
    );
}

AdminGroupShow.layout = {
    breadcrumbs: [{ title: 'Groups', href: index() }],
};
