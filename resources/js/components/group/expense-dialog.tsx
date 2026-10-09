import { router } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    Paperclip,
    Plus,
    StickyNote,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import MemberController from '@/actions/App/Http/Controllers/MemberController';
import { CategoryIcon, categoryLabel } from '@/components/group/category-icon';
import { useGroup } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import { fromDateTimeInput, zoneLabel } from '@/components/group/time';
import { VatControl } from '@/components/group/vat-control';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useDateTimeInput } from '@/hooks/use-date-time-input';
import { toInput, toMinor } from '@/lib/money';
import { allocate, calculateSplit } from '@/lib/split';
import { cn } from '@/lib/utils';
import type { Expense, SplitType } from '@/types/group';

const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
    { value: 'equal', label: 'Equally' },
    { value: 'claim', label: 'Claim' },
    { value: 'exact', label: 'Exact' },
    { value: 'percent', label: '%' },
];

// No longer offered for new expenses, but older ones that use them can still be edited.
const LEGACY_SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
    { value: 'shares', label: 'Shares' },
    { value: 'adjustment', label: '+/−' },
];

const MULTIPLE = 'multiple';

// Receipt uploads are temporarily disabled (also rejected server-side in ExpenseRequest).
const RECEIPTS_ENABLED = false;

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    expense?: Expense | null;
};

export function ExpenseDialog({ open, onOpenChange, expense }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[94svh] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl p-0">
                {open && (
                    <ExpenseForm
                        key={expense?.id ?? 'new'}
                        expense={expense ?? null}
                        onDone={() => onOpenChange(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

function ExpenseForm({
    expense,
    onDone,
}: {
    expense: Expense | null;
    onDone: () => void;
}) {
    const { group, activeMembers, me, money, categories } = useGroup();
    const exp = group.exponent;
    const activeIds = new Set(activeMembers.map((m) => m.id));

    const [description, setDescription] = useState(expense?.description ?? '');
    const [amount, setAmount] = useState(
        expense ? toInput(expense.amount, exp) : '',
    );
    const [category, setCategory] = useState(expense?.category ?? 'general');
    const [spentAt, setSpentAt] = useDateTimeInput(expense?.spent_at);
    const [notes, setNotes] = useState(expense?.notes ?? '');
    const [showExtras, setShowExtras] = useState(
        Boolean(expense?.notes || expense?.receipt_url),
    );
    const [receipt, setReceipt] = useState<File | null>(null);
    const [removeReceipt, setRemoveReceipt] = useState(false);

    const [payer, setPayer] = useState<string>(() => {
        if (expense && expense.payers.length > 1) {
            return MULTIPLE;
        }

        const id =
            expense?.payers[0]?.member_id ?? me?.id ?? activeMembers[0]?.id;

        return String(id ?? '');
    });
    const [payerAmounts, setPayerAmounts] = useState<Record<number, string>>(
        () =>
            Object.fromEntries(
                (expense?.payers ?? []).map((p) => [
                    p.member_id,
                    toInput(p.amount, exp),
                ]),
            ),
    );

    const [splitType, setSplitType] = useState<SplitType>(
        expense?.split_type ?? 'equal',
    );
    const [included, setIncluded] = useState<Set<number>>(
        () =>
            new Set(
                expense
                    ? expense.splits
                          .map((s) => s.member_id)
                          .filter((id) => activeIds.has(id))
                    : activeMembers.map((m) => m.id),
            ),
    );
    const [values, setValues] = useState<Record<number, string>>(() =>
        Object.fromEntries(
            (expense?.splits ?? []).map((s) => [
                s.member_id,
                s.input_value !== null
                    ? String(Number(s.input_value))
                    : toInput(s.amount, exp),
            ]),
        ),
    );

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const total = toMinor(amount, exp);
    const usesInclusion =
        splitType === 'equal' ||
        splitType === 'adjustment' ||
        splitType === 'claim';
    // Claims people already made on this expense; the server keeps them on save.
    const claims = new Map(
        expense?.split_type === 'claim'
            ? expense.splits
                  .filter((s) => s.input_value !== null)
                  .map((s) => [s.member_id, s.amount])
            : [],
    );

    const rows = useMemo(
        () =>
            activeMembers
                .filter((m) =>
                    usesInclusion
                        ? included.has(m.id)
                        : (values[m.id] ?? '') !== '' &&
                          Number(values[m.id]) !== 0,
                )
                .map((m) => ({ member_id: m.id, value: values[m.id] ?? '' })),
        [activeMembers, usesInclusion, included, values],
    );

    const split = calculateSplit(total, splitType, rows, exp);

    const payerTotal = Object.entries(payerAmounts)
        .filter(([id]) => activeIds.has(Number(id)))
        .reduce((sum, [, v]) => sum + toMinor(v, exp), 0);
    const payersValid = payer !== MULTIPLE || payerTotal === total;

    const canSave =
        description.trim() !== '' && total > 0 && split.ok && payersValid;

    const toggle = (id: number) => {
        setIncluded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    // Someone added from inside the dialog joins the split straight away.
    const includeNewMember = (id: number) => {
        setIncluded((prev) => new Set(prev).add(id));

        if (splitType === 'shares') {
            setValues((prev) => ({ ...prev, [id]: '1' }));
        }
    };

    const changeSplitType = (type: SplitType) => {
        setSplitType(type);

        // Sensible starting values so the split is valid straight away.
        if (type === 'shares') {
            setValues(
                Object.fromEntries(activeMembers.map((m) => [m.id, '1'])),
            );
        } else if (type === 'percent') {
            const each = Math.floor(10000 / activeMembers.length) / 100;
            setValues(
                Object.fromEntries(
                    activeMembers.map((m, i) => [
                        m.id,
                        i === 0
                            ? String(
                                  Math.round(
                                      (100 -
                                          each * (activeMembers.length - 1)) *
                                          100,
                                  ) / 100,
                              )
                            : String(each),
                    ]),
                ),
            );
        } else {
            setValues({});
        }
    };

    // Grow every exact value by VAT. The new total is rounded once and spread
    // proportionally, so the values add up to exactly (old sum + VAT).
    const applyVat = (rate: number) => {
        const weights: [number, number][] = rows.map((r) => [
            r.member_id,
            toMinor(r.value, exp),
        ]);
        const sum = weights.reduce((s, [, w]) => s + w, 0);

        if (!(rate > 0) || sum <= 0) {
            return;
        }

        const grown = allocate(Math.round(sum * (1 + rate / 100)), weights);

        setValues((prev) => ({
            ...prev,
            ...Object.fromEntries(
                Object.entries(grown).map(([id, v]) => [id, toInput(v, exp)]),
            ),
        }));
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        if (!canSave) {
            return;
        }

        const payers =
            payer === MULTIPLE
                ? Object.entries(payerAmounts)
                      .filter(
                          ([id, v]) =>
                              activeIds.has(Number(id)) && toMinor(v, exp) > 0,
                      )
                      .map(([id, v]) => ({ member_id: Number(id), amount: v }))
                : [{ member_id: Number(payer), amount: amount }];

        const data = {
            description,
            amount,
            category,
            spent_at: fromDateTimeInput(spentAt),
            notes: notes || null,
            split_type: splitType,
            payers,
            splits: rows,
            remove_receipt: removeReceipt,
            ...(receipt ? { receipt } : {}),
        };

        const options = {
            preserveScroll: true,
            forceFormData: Boolean(receipt),
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onError: (errs: Record<string, string>) => setErrors(errs),
            onSuccess: () => onDone(),
        };

        if (expense) {
            router.post(
                ExpenseController.update.url([group.slug, expense.id]),
                { ...data, _method: 'put' },
                options,
            );
        } else {
            router.post(ExpenseController.store.url(group.slug), data, options);
        }
    };

    const generalError =
        errors.splits ||
        errors.payers ||
        Object.entries(errors).find(([k]) => k.includes('.'))?.[1];

    return (
        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div className="border-b px-5 pt-5 pb-4">
                <DialogTitle className="text-lg">
                    {expense ? 'Edit expense' : 'Add an expense'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                    Describe the expense, who paid and how to split it.
                </DialogDescription>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
                {/* What & how much */}
                <div className="flex items-start gap-3">
                    <CategoryIcon category={category} className="size-12" />
                    <div className="min-w-0 flex-1 space-y-2">
                        <Input
                            autoFocus={!expense}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What was it for?"
                            maxLength={120}
                            className="h-11 text-base"
                        />
                        <InputError message={errors.description} />
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                                {group.currency}
                            </span>
                            <Input
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value.replace(/[^0-9.]/g, ''),
                                    )
                                }
                                inputMode="decimal"
                                placeholder={(0).toFixed(exp)}
                                className="tabular h-14 pl-14 text-2xl font-semibold"
                            />
                        </div>
                        <InputError message={errors.amount} />
                    </div>
                </div>

                <div className="-mx-5 flex scrollbar-none gap-1.5 overflow-x-auto px-5">
                    {categories.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setCategory(c)}
                            className={cn(
                                'shrink-0 rounded-full border px-3 py-1 text-xs transition-colors',
                                category === c
                                    ? 'border-primary/60 bg-primary/15 text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {categoryLabel(c)}
                        </button>
                    ))}
                </div>

                {/* Paid by & when */}
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                            Paid by
                        </span>
                        <Select value={payer} onValueChange={setPayer}>
                            <SelectTrigger className="w-full data-[size=default]:h-10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {activeMembers.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        <MemberAvatar member={m} size="xs" />
                                        {m.id === me?.id ? 'You' : m.name}
                                    </SelectItem>
                                ))}
                                <SelectItem value={MULTIPLE}>
                                    <Users className="size-4" />
                                    Multiple people
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <span className="text-xs font-medium text-muted-foreground">
                            Date & time{' '}
                            <span className="text-muted-foreground/60">
                                ({zoneLabel()})
                            </span>
                        </span>
                        <Input
                            type="datetime-local"
                            value={spentAt}
                            onChange={(e) => setSpentAt(e.target.value)}
                            className="h-10"
                        />
                        <InputError message={errors.spent_at} />
                    </div>
                </div>

                {payer === MULTIPLE && (
                    <div className="animate-pop-in space-y-2 rounded-xl border bg-white/2 p-3">
                        {activeMembers.map((m) => (
                            <div key={m.id} className="flex items-center gap-3">
                                <MemberAvatar member={m} size="sm" />
                                <span className="flex-1 truncate text-sm">
                                    {m.name}
                                </span>
                                <Input
                                    value={payerAmounts[m.id] ?? ''}
                                    onChange={(e) =>
                                        setPayerAmounts({
                                            ...payerAmounts,
                                            [m.id]: e.target.value.replace(
                                                /[^0-9.]/g,
                                                '',
                                            ),
                                        })
                                    }
                                    inputMode="decimal"
                                    placeholder="0"
                                    className="tabular h-8 w-28 text-right"
                                />
                            </div>
                        ))}
                        <Remaining
                            remaining={total - payerTotal}
                            label="paid"
                        />
                    </div>
                )}

                {/* Split */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-muted-foreground">
                            Split
                        </span>
                        <Segmented
                            size="sm"
                            value={splitType}
                            onChange={changeSplitType}
                            options={[
                                ...SPLIT_OPTIONS,
                                ...LEGACY_SPLIT_OPTIONS.filter(
                                    (o) => o.value === expense?.split_type,
                                ),
                            ]}
                        />
                    </div>

                    {splitType === 'exact' && (
                        <VatControl
                            onApply={applyVat}
                            disabled={rows.length === 0}
                            className="justify-end"
                        />
                    )}

                    <div className="divide-y rounded-xl border bg-white/2">
                        {activeMembers.map((m) => {
                            const on = usesInclusion
                                ? included.has(m.id)
                                : rows.some((r) => r.member_id === m.id);
                            const owed = split.amounts[m.id] ?? 0;

                            return (
                                <div
                                    key={m.id}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 transition-opacity',
                                        !on && 'opacity-50',
                                    )}
                                >
                                    {usesInclusion ? (
                                        <button
                                            type="button"
                                            onClick={() => toggle(m.id)}
                                            className={cn(
                                                'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                                                on &&
                                                    'border-primary bg-primary text-primary-foreground',
                                            )}
                                            aria-label={`Include ${m.name}`}
                                        >
                                            {on && (
                                                <Check className="size-3.5" />
                                            )}
                                        </button>
                                    ) : null}
                                    <MemberAvatar member={m} size="sm" />
                                    <span className="min-w-0 flex-1 truncate text-sm">
                                        {m.id === me?.id ? 'You' : m.name}
                                    </span>

                                    {splitType !== 'equal' &&
                                        splitType !== 'claim' && (
                                            <ValueInput
                                                type={splitType}
                                                value={values[m.id] ?? ''}
                                                disabled={
                                                    splitType ===
                                                        'adjustment' && !on
                                                }
                                                onChange={(v) =>
                                                    setValues({
                                                        ...values,
                                                        [m.id]: v,
                                                    })
                                                }
                                            />
                                        )}

                                    {splitType === 'claim' ? (
                                        <span className="w-24 text-right text-xs text-muted-foreground">
                                            {on &&
                                                (claims.has(m.id)
                                                    ? money(claims.get(m.id)!)
                                                    : 'claims later')}
                                        </span>
                                    ) : (
                                        <span
                                            className={cn(
                                                'tabular w-24 text-right text-sm',
                                                owed > 0
                                                    ? 'text-foreground'
                                                    : 'text-muted-foreground',
                                            )}
                                        >
                                            {money(owed)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                        <AddPersonRow onAdded={includeNewMember} />
                    </div>

                    {splitType === 'claim' && (
                        <p className="text-xs text-muted-foreground">
                            Each person enters how much of this they owe next
                            time they open the group. Anything nobody claims
                            stays with whoever paid.
                        </p>
                    )}

                    {!split.ok && total > 0 && (
                        <p className="text-sm text-amber-400">
                            {split.remaining !== undefined ? (
                                <Remaining
                                    remaining={split.remaining}
                                    label="assigned"
                                />
                            ) : (
                                split.error
                            )}
                        </p>
                    )}
                    <InputError message={generalError} />
                </div>

                {/* Notes & receipt */}
                {!showExtras ? (
                    <button
                        type="button"
                        onClick={() => setShowExtras(true)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <StickyNote className="size-4" />
                        {RECEIPTS_ENABLED
                            ? 'Add notes or a receipt'
                            : 'Add notes'}
                        <ChevronDown className="size-4" />
                    </button>
                ) : (
                    <div className="animate-pop-in space-y-3">
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notes (optional)"
                            maxLength={2000}
                            rows={2}
                        />
                        {RECEIPTS_ENABLED && (
                            <>
                                <ReceiptField
                                    existing={
                                        removeReceipt
                                            ? null
                                            : (expense?.receipt_url ?? null)
                                    }
                                    file={receipt}
                                    onFile={setReceipt}
                                    onRemoveExisting={() =>
                                        setRemoveReceipt(true)
                                    }
                                />
                                <InputError message={errors.receipt} />
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t bg-background/80 px-5 py-4 backdrop-blur">
                <span className="tabular text-sm text-muted-foreground">
                    {total > 0 && money(total)}
                </span>
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={onDone}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!canSave || processing}>
                        {processing && <Spinner />}
                        {expense ? 'Save changes' : 'Add expense'}
                    </Button>
                </div>
            </div>
        </form>
    );
}

/**
 * Inline "add someone new" at the bottom of the split list. Not a <form>,
 * because it lives inside the expense form; Enter is handled here instead.
 */
function AddPersonRow({ onAdded }: { onAdded: (id: number) => void }) {
    const { group } = useGroup();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState<string>();
    const [processing, setProcessing] = useState(false);

    const add = () => {
        if (!name.trim() || processing) {
            return;
        }

        router.post(
            MemberController.store.url(group.slug),
            { name },
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

                    setName('');
                    setError(undefined);
                    setOpen(false);

                    if (created) {
                        onAdded(created.id);
                    }
                },
            },
        );
    };

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
                <span className="flex size-7 items-center justify-center rounded-full border border-dashed">
                    <UserPlus className="size-3.5" />
                </span>
                Add someone new
            </button>
        );
    }

    return (
        <div className="space-y-1 px-3 py-2.5">
            <div className="flex items-center gap-2">
                <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add();
                        }
                    }}
                    placeholder="Their name"
                    maxLength={60}
                    className="h-8"
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={add}
                    disabled={processing || !name.trim()}
                >
                    {processing ? <Spinner /> : <Plus />}
                    Add
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                    aria-label="Cancel"
                >
                    <X />
                </Button>
            </div>
            <InputError message={error} />
        </div>
    );
}

function ValueInput({
    type,
    value,
    onChange,
    disabled,
}: {
    type: SplitType;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    const suffix = {
        percent: '%',
        shares: '×',
        exact: '',
        adjustment: '±',
        equal: '',
        claim: '',
    }[type];
    const allowNegative = type === 'adjustment';

    return (
        <div className="relative">
            <Input
                value={value}
                disabled={disabled}
                onChange={(e) =>
                    onChange(
                        e.target.value.replace(
                            allowNegative ? /[^0-9.-]/g : /[^0-9.]/g,
                            '',
                        ),
                    )
                }
                inputMode="decimal"
                placeholder="0"
                className={cn('tabular h-8 w-20 text-right', suffix && 'pr-6')}
            />
            {suffix && (
                <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
                    {suffix}
                </span>
            )}
        </div>
    );
}

function Remaining({ remaining, label }: { remaining: number; label: string }) {
    const { money } = useGroup();

    if (remaining === 0) {
        return (
            <span className="flex items-center gap-1 text-xs text-owed">
                <Check className="size-3.5" /> All {label}
            </span>
        );
    }

    return (
        <span className="text-xs text-amber-400">
            {remaining > 0
                ? `${money(remaining)} left`
                : `${money(-remaining)} too much`}
        </span>
    );
}

function ReceiptField({
    existing,
    file,
    onFile,
    onRemoveExisting,
}: {
    existing: string | null;
    file: File | null;
    onFile: (file: File | null) => void;
    onRemoveExisting: () => void;
}) {
    if (file || existing) {
        return (
            <div className="flex items-center gap-3 rounded-xl border bg-white/2 px-3 py-2 text-sm">
                <Paperclip className="size-4 text-muted-foreground" />
                {file ? (
                    <span className="flex-1 truncate">{file.name}</span>
                ) : (
                    <a
                        href={existing!}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 truncate text-primary hover:underline"
                    >
                        View current receipt
                    </a>
                )}
                <button
                    type="button"
                    onClick={() => (file ? onFile(null) : onRemoveExisting())}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Remove receipt"
                >
                    <X className="size-4" />
                </button>
            </div>
        );
    }

    return (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
            <Paperclip className="size-4" />
            Attach a receipt (photo or PDF, max 5 MB)
            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
        </label>
    );
}
