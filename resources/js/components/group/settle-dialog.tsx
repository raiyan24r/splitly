import { router } from '@inertiajs/react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import PaymentController from '@/actions/App/Http/Controllers/PaymentController';
import { useGroup } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import { fromDateTimeInput, zoneLabel } from '@/components/group/time';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const options = {
        preserveScroll: true,
        onStart: () => setProcessing(true),
        onFinish: () => setProcessing(false),
        onError: (e: Record<string, string>) => setErrors(e),
        onSuccess: onDone,
    };

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        const data = {
            from_member_id: Number(from),
            to_member_id: Number(to),
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
                        {selected
                            ? selected.id === me?.id
                                ? 'You'
                                : selected.name
                            : 'Choose'}
                    </span>
                </SelectTrigger>
                <SelectContent>
                    {activeMembers.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                            <MemberAvatar member={m} size="xs" />
                            {m.id === me?.id ? 'You' : m.name}
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
                            disabled={processing || !amount || from === to}
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
