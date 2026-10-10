import {
    Banknote,
    HandCoins,
    MessageCircle,
    Paperclip,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { CategoryIcon, categoryLabel } from '@/components/group/category-icon';
import { awaitsClaim, ClaimForm, unclaimedCut } from '@/components/group/claim';
import { displayName, useGroup } from '@/components/group/group-context';
import {
    dayKey,
    formatDate,
    formatDateTime,
    formatTime,
    monthKey,
    monthLabel,
} from '@/components/group/time';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Expense, Payment } from '@/types/group';

type Entry =
    | { kind: 'expense'; date: string; sort: [number, number]; item: Expense }
    | { kind: 'payment'; date: string; sort: [number, number]; item: Payment };

/** Newest first by when it happened, then by when it was entered. */
const sortKey = (at: string, createdAt: string): [number, number] => [
    Date.parse(at),
    Date.parse(createdAt),
];

export function ExpensesPanel({
    expenses,
    payments,
    onOpenExpense,
    onOpenPayment,
    onAdd,
}: {
    expenses: Expense[];
    payments: Payment[];
    onOpenExpense: (expense: Expense) => void;
    onOpenPayment: (payment: Payment) => void;
    onAdd: () => void;
}) {
    const { member } = useGroup();
    const [query, setQuery] = useState('');

    const months = useMemo(() => {
        const q = query.trim().toLowerCase();

        const entries: Entry[] = [
            ...expenses
                .filter(
                    (e) =>
                        !q ||
                        e.description.toLowerCase().includes(q) ||
                        categoryLabel(e.category).toLowerCase().includes(q) ||
                        (e.notes ?? '').toLowerCase().includes(q),
                )
                .map((e): Entry => ({
                    kind: 'expense',
                    date: e.spent_at,
                    sort: sortKey(e.spent_at, e.created_at),
                    item: e,
                })),
            ...payments
                .filter(
                    (p) =>
                        !q ||
                        'payment settle'.includes(q) ||
                        [p.from, p.to].some((id) =>
                            member(id)?.name.toLowerCase().includes(q),
                        ),
                )
                .map((p): Entry => ({
                    kind: 'payment',
                    date: p.paid_at,
                    sort: sortKey(p.paid_at, p.created_at),
                    item: p,
                })),
        ].sort((a, b) => b.sort[0] - a.sort[0] || b.sort[1] - a.sort[1]);

        const grouped = new Map<string, Entry[]>();

        for (const entry of entries) {
            const key = monthKey(entry.date);
            grouped.set(key, [...(grouped.get(key) ?? []), entry]);
        }

        return [...grouped.entries()];
    }, [expenses, payments, query, member]);

    if (expenses.length === 0 && payments.length === 0) {
        return (
            <Empty
                title="No expenses yet"
                hint="Add the first one and it will show up here."
                action={{ label: 'Add an expense', onClick: onAdd }}
            />
        );
    }

    return (
        <div className="space-y-6">
            <PendingClaims expenses={expenses} onOpenExpense={onOpenExpense} />

            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search expenses"
                    className="h-10 rounded-xl pl-9"
                />
            </div>

            {months.length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">
                    Nothing matches “{query}”.
                </p>
            )}

            {months.map(([month, entries]) => (
                <section key={month} className="space-y-1">
                    <h3 className="sticky top-0 z-10 bg-background/90 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase backdrop-blur">
                        {monthLabel(month)}
                    </h3>
                    {entries.map((entry) =>
                        entry.kind === 'expense' ? (
                            <ExpenseRow
                                key={`e${entry.item.id}`}
                                expense={entry.item}
                                onClick={() => onOpenExpense(entry.item)}
                            />
                        ) : (
                            <PaymentRow
                                key={`p${entry.item.id}`}
                                payment={entry.item}
                                onClick={() => onOpenPayment(entry.item)}
                            />
                        ),
                    )}
                </section>
            ))}
        </div>
    );
}

/** Claim expenses still waiting for the current member to enter their share. */
function PendingClaims({
    expenses,
    onOpenExpense,
}: {
    expenses: Expense[];
    onOpenExpense: (expense: Expense) => void;
}) {
    const { me, member, money, readOnly } = useGroup();

    const pending = expenses.filter((e) => awaitsClaim(e, me?.id));

    if (readOnly || pending.length === 0) {
        return null;
    }

    return (
        <section className="animate-pop-in space-y-3 rounded-2xl border border-amber-400/40 bg-amber-400/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-400">
                <HandCoins className="size-4" />
                {pending.length === 1
                    ? 'An expense is waiting for your share'
                    : `${pending.length} expenses are waiting for your share`}
            </div>
            {pending.map((e) => (
                <div
                    key={e.id}
                    className="space-y-2 rounded-xl border bg-background/60 p-3"
                >
                    <button
                        type="button"
                        onClick={() => onOpenExpense(e)}
                        className="flex w-full items-center gap-3 text-left"
                    >
                        <CategoryIcon category={e.category} />
                        <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">
                                {e.description}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">
                                {e.payers
                                    .map((p) =>
                                        displayName(
                                            member(p.member_id),
                                            me?.id,
                                        ),
                                    )
                                    .join(', ')}{' '}
                                paid{' '}
                                <span className="tabular">
                                    {money(e.amount)}
                                </span>{' '}
                                · {formatDate(dayKey(e.spent_at))}
                            </div>
                        </div>
                    </button>
                    <ClaimForm expense={e} />
                </div>
            ))}
        </section>
    );
}

function DateBadge({ date }: { date: string }) {
    const day = dayKey(date);

    return (
        <div
            className="flex w-9 shrink-0 flex-col items-center leading-none text-muted-foreground"
            title={formatDateTime(date)}
        >
            <span className="text-[10px] uppercase">
                {formatDate(day, {
                    month: 'short',
                    day: undefined,
                    year: undefined,
                })}
            </span>
            <span className="text-lg font-semibold text-foreground/80">
                {Number(day.slice(8, 10))}
            </span>
        </div>
    );
}

function ExpenseRow({
    expense,
    onClick,
}: {
    expense: Expense;
    onClick: () => void;
}) {
    const { me, member, money } = useGroup();

    const paid =
        expense.payers.find((p) => p.member_id === me?.id)?.amount ?? 0;
    const owed =
        (expense.splits.find((s) => s.member_id === me?.id)?.amount ?? 0) +
        unclaimedCut(expense, me?.id);
    const effect = paid - owed;
    const awaitingMe = awaitsClaim(expense, me?.id);

    const payerLabel =
        expense.payers.length > 1
            ? `${expense.payers.length} people paid`
            : `${displayName(member(expense.payers[0]?.member_id), me?.id)} paid`;

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/3',
                awaitingMe && 'bg-amber-400/5 ring-1 ring-amber-400/40',
            )}
        >
            <DateBadge date={expense.spent_at} />
            <CategoryIcon category={expense.category} />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <span className="truncate font-medium">
                        {expense.description}
                    </span>
                    {expense.receipt_url && (
                        <Paperclip className="size-3 shrink-0 text-muted-foreground" />
                    )}
                    {expense.comments.length > 0 && (
                        <span className="flex shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground">
                            <MessageCircle className="size-3" />
                            {expense.comments.length}
                        </span>
                    )}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                    {payerLabel}{' '}
                    <span className="tabular">{money(expense.amount)}</span>
                    <span className="text-muted-foreground/60">
                        {' '}
                        · {formatTime(expense.spent_at)}
                    </span>
                    {expense.unclaimed > 0 && (
                        <span className="text-amber-400/80">
                            {' '}
                            · {money(expense.unclaimed)} unclaimed
                        </span>
                    )}
                </div>
            </div>
            <div className="shrink-0 text-right">
                {awaitingMe ? (
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-400">
                        <HandCoins className="size-3.5" />
                        enter your share
                    </div>
                ) : me && effect !== 0 ? (
                    <>
                        <div
                            className={cn(
                                'text-[11px]',
                                effect > 0 ? 'text-owed/80' : 'text-owe/80',
                            )}
                        >
                            {effect > 0 ? 'you lent' : 'you borrowed'}
                        </div>
                        <div
                            className={cn(
                                'tabular text-sm font-semibold',
                                effect > 0 ? 'text-owed' : 'text-owe',
                            )}
                        >
                            {money(Math.abs(effect))}
                        </div>
                    </>
                ) : (
                    <div className="text-[11px] text-muted-foreground">
                        {me ? 'not involved' : ''}
                    </div>
                )}
            </div>
        </button>
    );
}

function PaymentRow({
    payment,
    onClick,
}: {
    payment: Payment;
    onClick: () => void;
}) {
    const { me, member, money } = useGroup();

    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/3"
        >
            <DateBadge date={payment.paid_at} />
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Banknote className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1 text-sm">
                <span className="font-medium">
                    {displayName(
                        member(payment.paid_by ?? payment.from),
                        me?.id,
                    )}
                </span>{' '}
                <span className="text-muted-foreground">paid</span>{' '}
                <span className="font-medium">
                    {displayName(member(payment.to), me?.id)}
                </span>
                {payment.paid_by !== null && (
                    <>
                        {' '}
                        <span className="text-muted-foreground">for</span>{' '}
                        <span className="font-medium">
                            {displayName(member(payment.from), me?.id)}
                        </span>
                    </>
                )}
                <div className="truncate text-xs text-muted-foreground">
                    {formatTime(payment.paid_at)}
                    {payment.paid_by !== null &&
                        payment.owes_payer_back &&
                        ` · owed back to ${displayName(member(payment.paid_by), me?.id)}`}
                    {payment.note && ` · ${payment.note}`}
                </div>
            </div>
            <span className="tabular shrink-0 text-sm font-semibold text-primary">
                {money(payment.amount)}
            </span>
        </button>
    );
}

export function Empty({
    title,
    hint,
    action,
}: {
    title: string;
    hint: string;
    action?: { label: string; onClick: () => void };
}) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-14 text-center">
            <div className="text-3xl">🧾</div>
            <div className="font-medium">{title}</div>
            <p className="max-w-xs text-sm text-muted-foreground">{hint}</p>
            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="mt-2 text-sm font-medium text-primary hover:underline"
                >
                    {action.label} →
                </button>
            )}
        </div>
    );
}
