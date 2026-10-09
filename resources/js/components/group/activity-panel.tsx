import { router } from '@inertiajs/react';
import {
    Banknote,
    KeyRound,
    LogOut,
    MessageCircle,
    Repeat,
    UserCheck,
    Pencil,
    Plus,
    RotateCcw,
    Settings2,
    Trash2,
    UserMinus,
    UserPlus,
    type LucideIcon,
} from 'lucide-react';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import { DeviceLine } from '@/components/device-line';
import { useGroup } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import {
    dayKey,
    formatDate,
    formatDateTime,
    formatTime,
    timeAgo,
} from '@/components/group/time';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ActivityItem, DeletedExpense } from '@/types/group';

function iconFor(action: string): { icon: LucideIcon; tone: string } {
    if (action.endsWith('.deleted') || action === 'member.removed') {
        return {
            icon: action.startsWith('member') ? UserMinus : Trash2,
            tone: 'text-owe',
        };
    }

    if (action.startsWith('payment')) {
        return { icon: Banknote, tone: 'text-primary' };
    }

    if (action.startsWith('comment')) {
        return { icon: MessageCircle, tone: 'text-sky-400' };
    }

    if (action === 'member.added' || action === 'member.joined') {
        return { icon: UserPlus, tone: 'text-primary' };
    }

    if (action === 'identity.switched') {
        return { icon: Repeat, tone: 'text-amber-400' };
    }

    if (action === 'identity.selected') {
        return { icon: UserCheck, tone: 'text-sky-400' };
    }

    if (action === 'group.logged_out') {
        return { icon: LogOut, tone: 'text-muted-foreground' };
    }

    if (
        action.startsWith('group.unlock') ||
        action.startsWith('group.password')
    ) {
        return { icon: KeyRound, tone: 'text-amber-400' };
    }

    if (action.startsWith('group')) {
        return { icon: Settings2, tone: 'text-muted-foreground' };
    }

    if (action.endsWith('.restored')) {
        return { icon: RotateCcw, tone: 'text-primary' };
    }

    if (action.endsWith('.created')) {
        return { icon: Plus, tone: 'text-primary' };
    }

    return { icon: Pencil, tone: 'text-muted-foreground' };
}

export function ActivityPanel({
    activity,
    deleted,
}: {
    activity: ActivityItem[];
    deleted: DeletedExpense[];
}) {
    const { group, member, money, readOnly } = useGroup();

    const days = new Map<string, ActivityItem[]>();

    for (const item of activity) {
        const key = dayKey(item.created_at);
        days.set(key, [...(days.get(key) ?? []), item]);
    }

    const restore = (id: number) =>
        router.post(
            ExpenseController.restore.url([group.slug, id]),
            {},
            { preserveScroll: true },
        );

    return (
        <div className="space-y-8">
            {deleted.length > 0 && !readOnly && (
                <section className="space-y-3">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Recently deleted
                    </h3>
                    <div className="divide-y rounded-2xl border bg-card">
                        {deleted.map((d) => (
                            <div
                                key={d.id}
                                className="flex items-center gap-3 px-4 py-2.5"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm line-through decoration-muted-foreground/50">
                                        {d.description}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {money(d.amount)} · deleted{' '}
                                        {formatDateTime(d.deleted_at)}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => restore(d.id)}
                                >
                                    <RotateCcw /> Restore
                                </Button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {[...days.entries()].map(([day, items]) => (
                <section key={day} className="space-y-1">
                    <h3 className="py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {formatDate(day, { weekday: 'short' })}
                    </h3>
                    <ol className="space-y-1">
                        {items.map((item) => {
                            const { icon: Icon, tone } = iconFor(item.action);
                            const actor = member(item.actor_member_id);

                            return (
                                <li
                                    key={item.id}
                                    className="flex items-start gap-3 rounded-xl px-2 py-2"
                                >
                                    <div className="relative">
                                        <MemberAvatar
                                            member={
                                                actor ?? {
                                                    name: item.actor_name,
                                                    color: '#71717a',
                                                }
                                            }
                                            size="md"
                                        />
                                        <span
                                            className={cn(
                                                'absolute -right-1 -bottom-1 flex size-4.5 items-center justify-center rounded-full bg-background ring-1 ring-border',
                                                tone,
                                            )}
                                        >
                                            <Icon className="size-2.5" />
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1 text-sm">
                                        <span className="font-medium">
                                            {item.actor_name}
                                        </span>{' '}
                                        <span className="text-muted-foreground">
                                            {lowerFirst(item.description)}
                                        </span>
                                        <time
                                            dateTime={item.created_at}
                                            title={formatDateTime(
                                                item.created_at,
                                            )}
                                            className="block text-[11px] text-muted-foreground/70"
                                        >
                                            {formatTime(item.created_at)} ·{' '}
                                            {timeAgo(item.created_at)}
                                        </time>
                                        <DeviceLine
                                            device={item.device}
                                            tag={item.device_tag}
                                            trail={item.device_trail}
                                            className="mt-0.5"
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>
            ))}
        </div>
    );
}

function lowerFirst(text: string) {
    return text.charAt(0).toLowerCase() + text.slice(1);
}
