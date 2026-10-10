import { router } from '@inertiajs/react';
import { ArrowRight, HandHeart, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import PaymentController from '@/actions/App/Http/Controllers/PaymentController';
import { displayName, useGroup } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import { fromDateTimeInput, zoneLabel } from '@/components/group/time';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useDateTimeInput } from '@/hooks/use-date-time-input';
import { toInput } from '@/lib/money';
import type { Payment } from '@/types/group';

export type SettleDraft = {
    payment?: Payment;
    from?: number;
    to?: number;
    amount?: number;
};

export function SettleDialog({
    draft,
    onClose,
}: {
    draft: SettleDraft | null;
    onClose: () => void;
}) {
    return (
        <Dialog
            open={draft !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <DialogContent className="max-w-md rounded-2xl">
                {draft && <SettleForm draft={draft} onDone={onClose} />}
            </DialogContent>
        </Dialog>
    );
}

function SettleForm({
    draft,
    onDone,
}: {
    draft: SettleDraft;
    onDone: () => void;
}) {
    const { group, activeMembers, member, me, readOnly } = useGroup();
    const editing = draft.payment;

    const [from, setFrom] = useState(
        String(
            editing?.from ?? draft.from ?? me?.id ?? activeMembers[0]?.id ?? '',
        ),
    );
    const [to, setTo] = useState(
        String(
            editing?.to ??
                draft.to ??
                activeMembers.find((m) => String(m.id) !== from)?.id ??
                '',
        ),
    );
    const [amount, setAmount] = useState(
        editing
            ? toInput(editing.amount, group.exponent)
            : draft.amount
              ? toInput(draft.amount, group.exponent)
              : '',
    );
    const [paidAt, setPaidAt] = useDateTimeInput(editing?.paid_at);
    const [note, setNote] = useState(editing?.note ?? '');
    // Someone else paying on From's behalf.
    const [onBehalf, setOnBehalf] = useState(Boolean(editing?.paid_by));
    const [paidBy, setPaidBy] = useState(String(editing?.paid_by ?? ''));
    const [owesBack, setOwesBack] = useState(editing?.owes_payer_back ?? false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const options = {
        preserveScroll: true,
        onStart: () => setProcessing(true),
        onFinish: () => setProcessing(false),
        onError: (e: Record<string, string>) => setErrors(e),
        onSuccess: onDone,
    };

    // Picking the payer as From or To afterwards clears the choice.
    const payer = paidBy !== from && paidBy !== to ? paidBy : '';
    const name = (id: string) =>
        Number(id) === me?.id ? 'you' : (member(Number(id))?.name ?? 'them');

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const data = {
            from_member_id: Number(from),
            to_member_id: Number(to),
            paid_by_member_id: onBehalf && payer ? Number(payer) : null,
            owes_payer_back: onBehalf && payer !== '' && owesBack,
            amount,
            paid_at: fromDateTimeInput(paidAt),
            note: note || null,
        };

        if (editing) {
            router.put(
                PaymentController.update.url([group.slug, editing.id]),
                data,
                options,
            );
        } else {
            router.post(PaymentController.store.url(group.slug), data, options);
        }
    };

    const remove = () => {
        if (editing) {
            router.delete(
                PaymentController.destroy.url([group.slug, editing.id]),
                options,
            );
        }
    };

    const person = (
        label: string,
        value: string,
        onChange: (v: string) => void,
    ) => {
        const selected = member(Number(value));

        return (
            <Select value={value} onValueChange={onChange} disabled={readOnly}>
                <SelectTrigger
                    aria-label={label}
                    className="h-auto w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-3 py-3 whitespace-normal hover:border-primary/40 data-[size=default]:h-auto [&>svg]:hidden"
                >
                    <MemberAvatar member={selected} size="md" />
                    <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                        {label}
                    </span>
                    <span className="w-full truncate text-center text-sm font-medium">
                        {selected ? displayName(selected, me?.id) : 'Choose'}
                    </span>
                </SelectTrigger>
                <SelectContent>
                    {activeMembers.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                            <MemberAvatar member={m} size="xs" />
                            {displayName(m, me?.id)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    };

    return (
        <form onSubmit={submit} className="space-y-5">
            <DialogHeader>
                <DialogTitle>
                    {editing ? 'Edit payment' : 'Settle up'}
                </DialogTitle>
                <DialogDescription>
                    Record money paid back outside the app (cash, bank
                    transfer…).
                </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                {person('From', from, setFrom)}
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ArrowRight className="size-4" />
                </span>
                {person('To', to, setTo)}
            </div>
            <InputError
                message={errors.to_member_id || errors.from_member_id}
            />

            {!onBehalf ? (
                !readOnly && (
                    <button
                        type="button"
                        onClick={() => setOnBehalf(true)}
                        className="flex w-full items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 text-left text-xs transition-colors hover:bg-primary/10"
                    >
                        <HandHeart className="size-4 shrink-0 text-primary" />
                        <span className="text-muted-foreground">
                            <span className="font-medium text-primary">
                                Someone else paid this for {name(from)}?
                            </span>{' '}
                            Record who covered it, and whether they want it
                            back.
                        </span>
                    </button>
                )
            ) : (
                <div className="animate-pop-in space-y-3 rounded-xl border bg-white/2 p-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            Paid on {name(from)}&rsquo;s behalf by
                        </span>
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={() => setOnBehalf(false)}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Nobody else paid"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                    <Select
                        value={payer}
                        onValueChange={setPaidBy}
                        disabled={readOnly}
                    >
                        <SelectTrigger className="w-full data-[size=default]:h-10">
                            <SelectValue placeholder="Choose who paid" />
                        </SelectTrigger>
                        <SelectContent>
                            {activeMembers
                                .filter(
                                    (m) =>
                                        String(m.id) !== from &&
                                        String(m.id) !== to,
                                )
                                .map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        <MemberAvatar member={m} size="xs" />
                                        {displayName(m, me?.id)}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                    {payer && (
                        <>
                            <label className="flex items-center gap-2 text-sm">
                                <Checkbox
                                    checked={owesBack}
                                    onCheckedChange={(c) =>
                                        setOwesBack(c === true)
                                    }
                                    disabled={readOnly}
                                />
                                <span className="first-letter:uppercase">
                                    {name(from)} will pay {name(payer)} back
                                </span>
                            </label>
                            <p className="text-xs text-muted-foreground">
                                {owesBack
                                    ? `Settled with ${name(to)}, and now owed to ${name(payer)} instead.`
                                    : `Settled with ${name(to)}, and nothing is owed to ${name(payer)}.`}
                            </p>
                        </>
                    )}
                    <InputError message={errors.paid_by_member_id} />
                </div>
            )}

            <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                    {group.currency}
                </span>
                <Input
                    autoFocus
                    value={amount}
                    onChange={(e) =>
                        setAmount(e.target.value.replace(/[^0-9.]/g, ''))
                    }
                    inputMode="decimal"
                    placeholder={(0).toFixed(group.exponent)}
                    className="tabular h-14 pl-14 text-2xl font-semibold"
                />
            </div>
            <InputError message={errors.amount} />

            <div className="grid gap-3 sm:grid-cols-2">
                <Input
                    type="datetime-local"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    aria-label={`Date & time (${zoneLabel()})`}
                    title={`Date & time (${zoneLabel()})`}
                />
                <Input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Note (optional)"
                    maxLength={255}
                />
            </div>
            <InputError message={errors.paid_at} />

            <div className="flex items-center justify-between gap-2">
                {editing && !readOnly ? (
                    <Button type="button" variant="ghost" onClick={remove}>
                        <Trash2 /> Delete
                    </Button>
                ) : (
                    <span />
                )}
                <div className="flex gap-2">
                    <Button type="button" variant="ghost" onClick={onDone}>
                        Cancel
                    </Button>
                    {!readOnly && (
                        <Button
                            type="submit"
                            disabled={
                                processing ||
                                !amount ||
                                from === to ||
                                (onBehalf && !payer)
                            }
                        >
                            {processing && <Spinner />}
                            {editing ? 'Save' : 'Record payment'}
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}
