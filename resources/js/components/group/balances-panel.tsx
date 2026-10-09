import { router } from '@inertiajs/react';
import { ArrowRight, PartyPopper, Sparkles } from 'lucide-react';
import GroupController from '@/actions/App/Http/Controllers/GroupController';
import { displayName, useGroup } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import type { SettleDraft } from '@/components/group/settle-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { Balances } from '@/types/group';

export function BalancesPanel({
    balances,
    onSettle,
}: {
    balances: Balances;
    onSettle: (draft: SettleDraft) => void;
}) {
    const { group, members, me, member, money, readOnly } = useGroup();
    const transfers = group.simplify_debts
        ? balances.simplified
        : balances.pairwise;

    const people = members
        .filter((m) => !m.removed || (balances.net[m.id] ?? 0) !== 0)
        .sort((a, b) => (balances.net[b.id] ?? 0) - (balances.net[a.id] ?? 0));

    const toggleSimplify = (value: boolean) =>
        router.patch(
            GroupController.updateSettings.url(group.slug),
            { simplify_debts: value },
            { preserveScroll: true },
        );

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {group.simplify_debts
                            ? 'Suggested payments'
                            : 'Who owes whom'}
                    </h3>
                    {!readOnly && (
                        <label className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Sparkles className="size-3.5 text-primary" />
                            Simplify
                            <Switch
                                checked={group.simplify_debts}
                                onCheckedChange={toggleSimplify}
                                aria-label="Simplify debts"
                            />
                        </label>
                    )}
                </div>

                {transfers.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-2xl border bg-primary/5 px-4 py-5 text-sm">
                        <PartyPopper className="size-5 text-primary" />
                        Everyone is settled up. Nice!
                    </div>
                ) : (
                    <div className="divide-y rounded-2xl border bg-card">
                        {transfers.map((t) => {
                            const mine = t.from === me?.id || t.to === me?.id;

                            return (
                                <div
                                    key={`${t.from}-${t.to}`}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3',
                                        mine && 'bg-primary/4',
                                    )}
                                >
                                    <div className="flex items-center -space-x-1.5">
                                        <MemberAvatar
                                            member={member(t.from)}
                                            size="sm"
                                            className="ring-2 ring-card"
                                        />
                                        <MemberAvatar
                                            member={member(t.to)}
                                            size="sm"
                                            className="ring-2 ring-card"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1 text-sm">
                                        <span className="font-medium">
                                            {displayName(
                                                member(t.from),
                                                me?.id,
                                            )}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {t.from === me?.id
                                                ? ' owe '
                                                : ' owes '}
                                        </span>
                                        <span className="font-medium">
                                            {displayName(member(t.to), me?.id)}
                                        </span>
                                        <div
                                            className={cn(
                                                'tabular text-sm font-semibold',
                                                t.from === me?.id
                                                    ? 'text-owe'
                                                    : t.to === me?.id
                                                      ? 'text-owed'
                                                      : 'text-foreground',
                                            )}
                                        >
                                            {money(t.amount)}
                                        </div>
                                    </div>
                                    {!readOnly && (
                                        <Button
                                            size="sm"
                                            variant={
                                                mine ? 'default' : 'secondary'
                                            }
                                            onClick={() =>
                                                onSettle({
                                                    from: t.from,
                                                    to: t.to,
                                                    amount: t.amount,
                                                })
                                            }
                                        >
                                            Settle
                                            <ArrowRight />
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {group.simplify_debts && transfers.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        Debts are simplified into the fewest payments. Everyone
                        still ends up with exactly the right amount.
                    </p>
                )}
            </section>

            <section className="space-y-3">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Balances
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                    {people.map((m) => {
                        const net = balances.net[m.id] ?? 0;

                        return (
                            <div
                                key={m.id}
                                className={cn(
                                    'flex items-center gap-3 rounded-2xl border bg-card px-4 py-3',
                                    m.id === me?.id && 'border-primary/40',
                                )}
                            >
                                <MemberAvatar member={m} />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium">
                                        {displayName(m, me?.id)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        paid {money(balances.paid[m.id] ?? 0)} ·
                                        share {money(balances.share[m.id] ?? 0)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div
                                        className={cn(
                                            'text-[11px]',
                                            net > 0
                                                ? 'text-owed/80'
                                                : net < 0
                                                  ? 'text-owe/80'
                                                  : 'text-muted-foreground',
                                        )}
                                    >
                                        {net > 0
                                            ? 'gets back'
                                            : net < 0
                                              ? 'owes'
                                              : 'settled'}
                                    </div>
                                    {net !== 0 && (
                                        <div
                                            className={cn(
                                                'tabular text-sm font-semibold',
                                                net > 0
                                                    ? 'text-owed'
                                                    : 'text-owe',
                                            )}
                                        >
                                            {money(Math.abs(net))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
