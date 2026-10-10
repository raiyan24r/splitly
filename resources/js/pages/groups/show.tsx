import { Head } from '@inertiajs/react';
import {
    Activity,
    Archive,
    Banknote,
    Check,
    Link2,
    Plus,
    Receipt,
    Scale,
    Settings,
    Share2,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityPanel } from '@/components/group/activity-panel';
import { BalancesPanel } from '@/components/group/balances-panel';
import { CountUp } from '@/components/group/count-up';
import { ExpenseDialog } from '@/components/group/expense-dialog';
import { ExpenseSheet } from '@/components/group/expense-sheet';
import { ExpensesPanel } from '@/components/group/expenses-panel';
import {
    buildMoney,
    GroupContext,
    type GroupContextValue,
} from '@/components/group/group-context';
import { IdentityMenu } from '@/components/group/identity-menu';
import { IdentityPicker } from '@/components/group/identity-picker';
import { MemberAvatar } from '@/components/group/member-avatar';
import { MembersPanel } from '@/components/group/members-panel';
import { SettingsPanel } from '@/components/group/settings-panel';
import {
    SettleDialog,
    type SettleDraft,
} from '@/components/group/settle-dialog';
import { ShareBalancesDialog } from '@/components/group/share-balances-dialog';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { useClipboard } from '@/hooks/use-clipboard';
import { setActiveGroup, useGroupIdentity } from '@/lib/identity';
import { cn } from '@/lib/utils';
import type { Expense, GroupPageProps } from '@/types/group';

type Tab = 'expenses' | 'balances' | 'members' | 'activity' | 'settings';

const TABS: { value: Tab; label: React.ReactNode }[] = [
    { value: 'expenses', label: <TabLabel icon={Receipt} text="Expenses" /> },
    { value: 'balances', label: <TabLabel icon={Scale} text="Balances" /> },
    { value: 'members', label: <TabLabel icon={Users} text="People" /> },
    { value: 'activity', label: <TabLabel icon={Activity} text="Activity" /> },
    { value: 'settings', label: <TabLabel icon={Settings} text="Settings" /> },
];

function TabLabel({
    icon: Icon,
    text,
}: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
}) {
    return (
        <span className="flex items-center gap-1.5">
            <Icon className="size-3.5" />
            {text}
        </span>
    );
}

export default function GroupShow(props: GroupPageProps) {
    const {
        group,
        members,
        expenses,
        payments,
        balances,
        activity,
        deletedExpenses,
        categories,
        isAdmin,
    } = props;

    // Requests made from this page carry the member picked for this group.
    useEffect(() => {
        setActiveGroup(group.id);

        return () => setActiveGroup(null);
    }, [group.id]);

    const [meId, setMeId] = useGroupIdentity(group.id);
    const [tab, setTab] = useState<Tab>('expenses');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [editing, setEditing] = useState<Expense | null | undefined>(
        undefined,
    );
    const [viewingId, setViewingId] = useState<number | null>(null);
    const [settle, setSettle] = useState<SettleDraft | null>(null);
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, copy] = useClipboard();

    const context = useMemo<GroupContextValue>(() => {
        const byId = new Map(members.map((m) => [m.id, m]));
        const active = members.filter((m) => !m.removed);
        const me = meId ? (byId.get(meId) ?? null) : null;

        return {
            group,
            members,
            activeMembers: active,
            member: (id) => (id ? byId.get(id) : undefined),
            me: me && !me.removed ? me : null,
            setMe: setMeId,
            money: buildMoney(group),
            isAdmin,
            readOnly: group.archived && !isAdmin,
            categories,
        };
    }, [group, members, meId, setMeId, isAdmin, categories]);

    const { me, money, readOnly, activeMembers } = context;
    const needsIdentity = me === null && !isAdmin;

    const openNew = useCallback(() => {
        if (readOnly) {
            return;
        }

        if (needsIdentity) {
            setPickerOpen(true);

            return;
        }

        setEditing(null);
    }, [readOnly, needsIdentity]);

    // Record a settle up from scratch (defaults to me paying someone).
    const openPayment = () => {
        if (readOnly) {
            return;
        }

        if (needsIdentity) {
            setPickerOpen(true);

            return;
        }

        setSettle({});
    };

    // Keyboard shortcut: "n" adds an expense.
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;

            if (
                event.key.toLowerCase() === 'n' &&
                !event.metaKey &&
                !event.ctrlKey &&
                !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) &&
                !target.isContentEditable &&
                !document.querySelector('[role="dialog"]')
            ) {
                event.preventDefault();
                openNew();
            }
        };

        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [openNew]);

    const viewing = expenses.find((e) => e.id === viewingId) ?? null;
    const myNet = me ? (balances.net[me.id] ?? 0) : 0;

    return (
        <GroupContext.Provider value={context}>
            <Head title={group.name} />

            <div className="glow min-h-svh">
                <div className="mx-auto max-w-3xl px-4 pt-6 pb-32 sm:px-6 sm:pt-10">
                    {/* Header */}
                    <header className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-semibold tracking-wide text-primary">
                                    splitly
                                </span>
                                <span>·</span>
                                <span>{group.currency}</span>
                                {group.archived && (
                                    <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-400">
                                        <Archive className="size-3" /> archived
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                {group.name}
                            </h1>
                            {group.description && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {group.description}
                                </p>
                            )}
                            <div className="mt-3 flex items-center -space-x-1.5">
                                {activeMembers.slice(0, 8).map((m) => (
                                    <MemberAvatar
                                        key={m.id}
                                        member={m}
                                        size="sm"
                                        className="ring-2 ring-background"
                                    />
                                ))}
                                {activeMembers.length > 8 && (
                                    <span className="pl-3 text-xs text-muted-foreground">
                                        +{activeMembers.length - 8}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShareOpen(true)}
                                title="Share balances"
                            >
                                <Share2 />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => void copy(group.url)}
                                title="Copy group link"
                            >
                                {copied ? (
                                    <Check className="text-primary" />
                                ) : (
                                    <Link2 />
                                )}
                            </Button>
                            <IdentityMenu
                                onSwitch={() => setPickerOpen(true)}
                            />
                        </div>
                    </header>

                    {/* Summary */}
                    <div className="mt-8 grid gap-3 sm:grid-cols-[1.4fr_1fr]">
                        <div className="relative overflow-hidden rounded-2xl border bg-card p-5">
                            <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                {!me
                                    ? 'Your balance'
                                    : myNet > 0
                                      ? 'You are owed'
                                      : myNet < 0
                                        ? 'You owe'
                                        : 'Your balance'}
                            </div>
                            <div
                                className={cn(
                                    'mt-2 text-3xl font-semibold tracking-tight sm:text-4xl',
                                    myNet > 0 && 'text-owed',
                                    myNet < 0 && 'text-owe',
                                )}
                            >
                                {me ? (
                                    myNet === 0 ? (
                                        'All settled ✨'
                                    ) : (
                                        <CountUp
                                            value={Math.abs(myNet)}
                                            format={(v) => money(v)}
                                        />
                                    )
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setPickerOpen(true)}
                                        className="text-lg text-primary hover:underline"
                                    >
                                        Pick your name to see it →
                                    </button>
                                )}
                            </div>
                            {me && myNet !== 0 && (
                                <button
                                    type="button"
                                    onClick={() => setTab('balances')}
                                    className="mt-3 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    See details →
                                </button>
                            )}
                        </div>
                        <div className="rounded-2xl border bg-card p-5">
                            <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Group spending
                            </div>
                            <div className="mt-2 text-2xl font-semibold tracking-tight">
                                <CountUp
                                    value={balances.total_spent}
                                    format={(v) => money(v)}
                                />
                            </div>
                            <div className="mt-3 text-xs text-muted-foreground">
                                {expenses.length}{' '}
                                {expenses.length === 1 ? 'expense' : 'expenses'}
                                {me &&
                                    ` · your share ${money(balances.share[me.id] ?? 0)}`}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mt-8 mb-5">
                        <Segmented
                            value={tab}
                            onChange={setTab}
                            options={TABS}
                        />
                    </div>

                    <div key={tab} className="animate-pop-in">
                        {tab === 'expenses' && (
                            <ExpensesPanel
                                expenses={expenses}
                                payments={payments}
                                onAdd={openNew}
                                onOpenExpense={(e) => setViewingId(e.id)}
                                onOpenPayment={(p) => setSettle({ payment: p })}
                            />
                        )}
                        {tab === 'balances' && (
                            <BalancesPanel
                                balances={balances}
                                onShare={() => setShareOpen(true)}
                                onSettle={(draft) =>
                                    needsIdentity
                                        ? setPickerOpen(true)
                                        : setSettle(draft)
                                }
                            />
                        )}
                        {tab === 'members' && (
                            <MembersPanel balances={balances} />
                        )}
                        {tab === 'activity' && (
                            <ActivityPanel
                                activity={activity}
                                deleted={deletedExpenses}
                            />
                        )}
                        {tab === 'settings' && (
                            <SettingsPanel
                                onSwitchIdentity={() => setPickerOpen(true)}
                            />
                        )}
                    </div>
                </div>

                {/* Floating add button */}
                {!readOnly && (
                    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center gap-2 bg-linear-to-t from-background via-background/80 to-transparent pt-10 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={openPayment}
                            className="pointer-events-auto h-12 rounded-full px-5 text-base"
                        >
                            <Banknote className="size-5" />
                            Add payment
                        </Button>
                        <Button
                            size="lg"
                            onClick={openNew}
                            className="pointer-events-auto h-12 rounded-full px-6 text-base shadow-[0_8px_30px_-6px] shadow-primary/40"
                        >
                            <Plus className="size-5" />
                            Add expense
                            <kbd className="ml-1 hidden rounded bg-black/15 px-1.5 text-[10px] font-medium sm:inline">
                                N
                            </kbd>
                        </Button>
                    </div>
                )}
            </div>

            <IdentityPicker
                open={pickerOpen || needsIdentity}
                onOpenChange={setPickerOpen}
                dismissible={!needsIdentity}
            />
            <ExpenseDialog
                open={editing !== undefined}
                onOpenChange={(open) => !open && setEditing(undefined)}
                expense={editing}
            />
            <ExpenseSheet
                expense={viewing}
                history={activity.filter(
                    (a) =>
                        a.subject_type === 'expense' &&
                        a.subject_id === viewingId,
                )}
                onClose={() => setViewingId(null)}
                onEdit={(e) => {
                    setViewingId(null);
                    setEditing(e);
                }}
            />
            <SettleDialog draft={settle} onClose={() => setSettle(null)} />
            <ShareBalancesDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                balances={balances}
            />
        </GroupContext.Provider>
    );
}
