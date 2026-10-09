import { router } from '@inertiajs/react';
import { useState } from 'react';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import { useGroup } from '@/components/group/group-context';
import { VatControl } from '@/components/group/vat-control';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { toInput, toMinor } from '@/lib/money';
import { allocate } from '@/lib/split';
import { cn } from '@/lib/utils';
import type { Expense } from '@/types/group';

/** Claim expenses: the member's row, if they are one of the people involved. */
export function claimOf(expense: Expense, memberId: number | undefined) {
    return expense.split_type === 'claim'
        ? expense.splits.find((s) => s.member_id === memberId)
        : undefined;
}

/** Is this claim expense still waiting for the member to enter their share? */
export function awaitsClaim(expense: Expense, memberId: number | undefined) {
    return claimOf(expense, memberId)?.input_value === null;
}

/** A payer's cut of the unclaimed part (mirrors Expense::owedShares()). */
export function unclaimedCut(expense: Expense, memberId: number | undefined) {
    if (expense.unclaimed <= 0 || memberId === undefined) {
        return 0;
    }

    return (
        allocate(
            expense.unclaimed,
            expense.payers.map((p) => [p.member_id, p.amount]),
        )[memberId] ?? 0
    );
}

/** Lets the current member enter (or change) how much of an expense they owe. */
export function ClaimForm({
    expense,
    className,
}: {
    expense: Expense;
    className?: string;
}) {
    const { group, me, money } = useGroup();
    const exp = group.exponent;
    const mine = claimOf(expense, me?.id);
    // What this member could claim: their current claim plus whatever is unclaimed.
    const available = (mine?.amount ?? 0) + expense.unclaimed;

    const [amount, setAmount] = useState(
        mine && mine.input_value !== null ? toInput(mine.amount, exp) : '',
    );
    const [error, setError] = useState<string>();
    const [processing, setProcessing] = useState(false);

    if (!mine) {
        return null;
    }

    const addVat = (rate: number) =>
        setAmount(
            toInput(Math.round(toMinor(amount, exp) * (1 + rate / 100)), exp),
        );

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (amount === '' || processing) {
            return;
        }

        router.put(
            ExpenseController.claim.url([group.slug, expense.id]),
            { amount },
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
                onError: (errors) => setError(errors.amount),
                onSuccess: () => setError(undefined),
            },
        );
    };

    return (
        <form onSubmit={submit} className={cn('space-y-1.5', className)}>
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        {group.currency}
                    </span>
                    <Input
                        value={amount}
                        onChange={(e) =>
                            setAmount(e.target.value.replace(/[^0-9.]/g, ''))
                        }
                        inputMode="decimal"
                        placeholder={(0).toFixed(exp)}
                        aria-label="Your share"
                        className="tabular h-9 pl-12"
                    />
                </div>
                <Button
                    type="submit"
                    size="sm"
                    className="h-9"
                    disabled={amount === '' || processing}
                >
                    {processing && <Spinner />}
                    {mine.input_value === null ? 'Save my share' : 'Update'}
                </Button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                {available > 0 ? (
                    <button
                        type="button"
                        onClick={() => setAmount(toInput(available, exp))}
                        className="text-xs text-muted-foreground hover:text-primary"
                    >
                        {money(available)} available · use all
                    </button>
                ) : (
                    <span />
                )}
                <VatControl
                    onApply={addVat}
                    disabled={toMinor(amount, exp) <= 0}
                />
            </div>
            <InputError message={error} />
        </form>
    );
}
