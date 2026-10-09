import { Head, Link, router } from '@inertiajs/react';
import { ChevronDown, Search, X } from 'lucide-react';
import { useState } from 'react';
import { DeviceLine } from '@/components/device-line';
import { formatDateTime, zoneLabel } from '@/components/group/time';
import { When } from '@/components/when';
import Heading from '@/components/heading';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { index } from '@/routes/admin/audit-logs';

type Log = {
    id: number;
    group: { name: string; slug: string } | null;
    actor_type: 'admin' | 'member' | 'guest';
    actor_name: string;
    action: string;
    description: string;
    changes: Record<string, unknown> | null;
    ip: string | null;
    user_agent: string | null;
    device: string | null;
    device_id: string | null;
    device_tag: string | null;
    device_trail: string[];
    created_at: string;
};

type Paginated<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    total: number;
};

type Filters = { group?: string; action?: string; q?: string; device?: string };

const ALL = '__all';

const actorTone = {
    admin: 'bg-violet-400/15 text-violet-300',
    member: 'bg-primary/15 text-primary',
    guest: 'bg-white/10 text-muted-foreground',
};

export default function AuditLogs({
    logs,
    filters,
    groups,
    actions,
}: {
    logs: Paginated<Log>;
    filters: Filters;
    groups: { name: string; slug: string }[];
    actions: string[];
}) {
    const [q, setQ] = useState(filters.q ?? '');
    const [open, setOpen] = useState<number | null>(null);

    const apply = (next: Filters) => {
        const query = Object.fromEntries(
            Object.entries({ ...filters, ...next }).filter(([, v]) => v),
        );

        router.get(
            index.url({ query }),
            {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Audit log" />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
                <Heading
                    title="Audit log"
                    description={`Every change, unlock and failed password attempt · ${logs.total} entries`}
                />

                <div className="flex flex-col gap-2 sm:flex-row">
                    <form
                        className="relative flex-1"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply({ q });
                        }}
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search description, person or IP"
                            className="pl-9"
                        />
                    </form>
                    <Select
                        value={filters.group ?? ALL}
                        onValueChange={(v) =>
                            apply({ group: v === ALL ? '' : v })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-52">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                            <SelectItem value={ALL}>All groups</SelectItem>
                            {groups.map((g) => (
                                <SelectItem key={g.slug} value={g.slug}>
                                    {g.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.action ?? ALL}
                        onValueChange={(v) =>
                            apply({ action: v === ALL ? '' : v })
                        }
                    >
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All actions</SelectItem>
                            {actions.map((a) => (
                                <SelectItem key={a} value={a}>
                                    {a.charAt(0).toUpperCase() + a.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {filters.device && (
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                            Showing one device:
                        </span>
                        <span className="rounded bg-white/5 px-1.5 font-mono text-xs">
                            {filters.device}
                        </span>
                        <button
                            type="button"
                            onClick={() => apply({ device: '' })}
                            className="flex items-center gap-1 text-primary hover:underline"
                        >
                            <X className="size-3.5" /> Clear
                        </button>
                    </div>
                )}

                <div className="divide-y rounded-2xl border bg-card">
                    {logs.data.length === 0 && (
                        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                            No entries match.
                        </p>
                    )}
                    {logs.data.map((log) => (
                        <div key={log.id} className="px-5 py-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setOpen(open === log.id ? null : log.id)
                                }
                                className="flex w-full items-start gap-3 text-left"
                            >
                                <span
                                    className={cn(
                                        'mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                                        actorTone[log.actor_type],
                                    )}
                                >
                                    {log.actor_type}
                                </span>
                                <div className="min-w-0 flex-1 text-sm">
                                    <span className="font-medium">
                                        {log.actor_name}
                                    </span>{' '}
                                    <span className="text-muted-foreground">
                                        {log.description}
                                    </span>
                                    <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground/70">
                                        {log.group && (
                                            <span>{log.group.name}</span>
                                        )}
                                        <span className="font-mono">
                                            {log.action}
                                        </span>
                                        <When iso={log.created_at} />
                                    </div>
                                    <DeviceLine
                                        device={log.device}
                                        tag={log.device_tag}
                                        trail={log.device_trail}
                                        expandable={false}
                                        className="mt-0.5"
                                    />
                                </div>
                                <ChevronDown
                                    className={cn(
                                        'mt-1 size-4 shrink-0 text-muted-foreground transition-transform',
                                        open === log.id && 'rotate-180',
                                    )}
                                />
                            </button>
                            {open === log.id && (
                                <dl className="animate-pop-in mt-3 grid gap-1 rounded-lg bg-white/3 p-3 font-mono text-xs">
                                    <Detail
                                        label="When"
                                        value={`${formatDateTime(log.created_at)} (${zoneLabel()})`}
                                    />
                                    <Detail label="IP" value={log.ip} />
                                    <Detail label="Device" value={log.device} />
                                    <Detail
                                        label="Device id"
                                        value={log.device_id}
                                    />
                                    <Detail
                                        label="Used as"
                                        value={
                                            log.device_trail.length
                                                ? log.device_trail.join(' → ')
                                                : null
                                        }
                                    />
                                    <Detail
                                        label="Browser"
                                        value={log.user_agent}
                                    />
                                    {log.changes && (
                                        <Detail
                                            label="Changes"
                                            value={JSON.stringify(
                                                log.changes,
                                                null,
                                                2,
                                            )}
                                            pre
                                        />
                                    )}
                                    {log.device_id &&
                                        filters.device !== log.device_id && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    apply({
                                                        device:
                                                            log.device_id ?? '',
                                                    })
                                                }
                                                className="mt-1 justify-self-start font-sans text-primary hover:underline"
                                            >
                                                Show everything from this device
                                                →
                                            </button>
                                        )}
                                </dl>
                            )}
                        </div>
                    ))}
                </div>

                {logs.links.length > 3 && (
                    <nav className="flex flex-wrap justify-center gap-1">
                        {logs.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    preserveState
                                    className={cn(
                                        'rounded-md px-3 py-1.5 text-sm',
                                        link.active
                                            ? 'bg-primary/15 text-primary'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 text-sm text-muted-foreground/40"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ),
                        )}
                    </nav>
                )}
            </div>
        </>
    );
}

function Detail({
    label,
    value,
    pre,
}: {
    label: string;
    value: string | null;
    pre?: boolean;
}) {
    if (!value) {
        return null;
    }

    return (
        <div className="grid grid-cols-[5rem_1fr] gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={cn('break-all', pre && 'whitespace-pre-wrap')}>
                {value}
            </dd>
        </div>
    );
}

AuditLogs.layout = {
    breadcrumbs: [{ title: 'Audit log', href: index() }],
};
