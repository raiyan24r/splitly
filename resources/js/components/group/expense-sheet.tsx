import { router } from '@inertiajs/react';
import { History, Paperclip, Pencil, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CommentController from '@/actions/App/Http/Controllers/CommentController';
import ExpenseController from '@/actions/App/Http/Controllers/ExpenseController';
import { DeviceLine } from '@/components/device-line';
import { CategoryIcon, categoryLabel } from '@/components/group/category-icon';
import { ClaimForm } from '@/components/group/claim';
import { displayName, useGroup } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import { When } from '@/components/when';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ActivityItem, Expense } from '@/types/group';

const SPLIT_LABELS: Record<string, string> = {
    equal: 'Split equally',
    exact: 'Split by exact amounts',
    percent: 'Split by percentage',
    shares: 'Split by shares',
    adjustment: 'Split equally with adjustments',
    claim: 'Everyone claims their own share',
};

export function ExpenseSheet({
    expense,
    history,
    onClose,
    onEdit,
}: {
    expense: Expense | null;
    history: ActivityItem[];
    onClose: () => void;
    onEdit: (expense: Expense) => void;
}) {
    return (
        <Sheet
            open={expense !== null}
            onOpenChange={(open) => !open && onClose()}
        >
            <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
                {expense && (
                    <Details
                        expense={expense}
                        history={history}
                        onClose={onClose}
                        onEdit={onEdit}
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}

function Details({
    expense,
    history,
    onClose,
    onEdit,
}: {
    expense: Expense;
    history: ActivityItem[];
    onClose: () => void;
    onEdit: (expense: Expense) => void;
}) {
    const { group, member, me, money, readOnly } = useGroup();
    const [comment, setComment] = useState('');
    const [sending, setSending] = useState(false);
    // Claim expenses: whose share is being filled in from the list.
    const [editing, setEditing] = useState<number | null>(null);

    const toggleEditing = (memberId: number) =>
        setEditing((current) => (current === memberId ? null : memberId));

    const remove = () => {
        router.delete(ExpenseController.destroy.url([group.slug, expense.id]), {
            preserveScroll: true,
            onSuccess: onClose,
        });
    };

    const send = (event: React.FormEvent) => {
        event.preventDefault();

        if (!comment.trim()) {
            return;
        }

        router.post(
            CommentController.store.url([group.slug, expense.id]),
            { body: comment },
            {
                preserveScroll: true,
                onStart: () => setSending(true),
                onFinish: () => setSending(false),
                onSuccess: () => setComment(''),
            },
        );
    };

    const deleteComment = (id: number) => {
        router.delete(
            CommentController.destroy.url([group.slug, expense.id, id]),
            { preserveScroll: true },
        );
    };

    const isImage = expense.receipt_url !== null && !expense.receipt_is_pdf;
    const isClaim = expense.split_type === 'claim';

    return (
        <div className="flex flex-col">
            <div className="glow space-y-4 border-b px-6 pt-8 pb-6">
                <CategoryIcon category={expense.category} className="size-12" />
                <div>
                    <SheetTitle className="text-xl leading-snug">
                        {expense.description}
                    </SheetTitle>
                    <SheetDescription>
                        {categoryLabel(expense.category)} ·{' '}
                        <When iso={expense.spent_at} relative={false} />
                    </SheetDescription>
                </div>
                <div className="tabular text-3xl font-semibold tracking-tight">
                    {money(expense.amount)}
                </div>
                <div className="space-y-0.5 text-xs text-muted-foreground">
                    <p>
                        Added by {expense.created_by ?? 'someone'} ·{' '}
                        <When iso={expense.created_at} />
                    </p>
                    {expense.updated_at !== expense.created_at && (
                        <p>
                            Last edited · <When iso={expense.updated_at} />
                        </p>
                    )}
                </div>
                {!readOnly && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onEdit(expense)}
                        >
                            <Pencil /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={remove}>
                            <Trash2 /> Delete
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-8 px-6 py-6">
                <section className="space-y-3">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Paid by
                    </h3>
                    {expense.payers.map((p) => (
                        <Row
                            key={p.member_id}
                            memberId={p.member_id}
                            right={money(p.amount)}
                            label={`${displayName(member(p.member_id), me?.id)} paid`}
                        />
                    ))}
                </section>

                <section className="space-y-3">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {SPLIT_LABELS[expense.split_type]}
                    </h3>
                    {expense.splits.map((s) => {
                        // Your own share has its form below; anyone else's can be set from here.
                        const editable =
                            isClaim && !readOnly && s.member_id !== me?.id;
                        const row =
                            isClaim && s.input_value === null ? (
                                <Row
                                    memberId={s.member_id}
                                    right="not claimed yet"
                                    muted
                                    label={displayName(
                                        member(s.member_id),
                                        me?.id,
                                    )}
                                    onEdit={
                                        editable
                                            ? () => toggleEditing(s.member_id)
                                            : undefined
                                    }
                                />
                            ) : (
                                <Row
                                    memberId={s.member_id}
                                    right={money(s.amount)}
                                    label={`${displayName(member(s.member_id), me?.id)} ${
                                        s.member_id === me?.id ? 'owe' : 'owes'
                                    }`}
                                    onEdit={
                                        editable
                                            ? () => toggleEditing(s.member_id)
                                            : undefined
                                    }
                                />
                            );

                        return (
                            <div key={s.member_id} className="space-y-2">
                                {row}
                                {editable && editing === s.member_id && (
                                    <ClaimForm
                                        expense={expense}
                                        memberId={s.member_id}
                                        onSaved={() => setEditing(null)}
                                        className="animate-pop-in pl-10"
                                    />
                                )}
                            </div>
                        );
                    })}
                    {expense.unclaimed > 0 && (
                        <p className="text-xs text-amber-400">
                            {money(expense.unclaimed)} unclaimed. It stays with
                            whoever paid until someone claims it.
                        </p>
                    )}
                    {isClaim && !readOnly && (
                        <ClaimForm expense={expense} className="pt-1" />
                    )}
                </section>

                {expense.notes && (
                    <section className="space-y-2">
                        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Notes
                        </h3>
                        <p className="text-sm whitespace-pre-line">
                            {expense.notes}
                        </p>
                    </section>
                )}

                {expense.receipt_url && (
                    <section className="space-y-2">
                        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            Receipt
                        </h3>
                        <a
                            href={expense.receipt_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-xl border"
                        >
                            {isImage ? (
                                <img
                                    src={expense.receipt_url}
                                    alt="Receipt"
                                    className="max-h-80 w-full object-cover"
                                    onError={(e) =>
                                        (e.currentTarget.style.display = 'none')
                                    }
                                />
                            ) : null}
                            <span className="flex items-center gap-2 px-3 py-2 text-sm text-primary">
                                <Paperclip className="size-4" /> Open receipt
                            </span>
                        </a>
                    </section>
                )}

                <section className="space-y-3">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Comments
                    </h3>
                    {expense.comments.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No comments yet.
                        </p>
                    )}
                    {expense.comments.map((c) => (
                        <div key={c.id} className="group flex gap-3">
                            <MemberAvatar
                                member={
                                    member(c.member_id) ?? {
                                        name: c.author_name,
                                        color: '#71717a',
                                    }
                                }
                                size="sm"
                            />
                            <div className="min-w-0 flex-1 rounded-xl rounded-tl-sm bg-white/4 px-3 py-2">
                                <div className="flex items-baseline justify-between gap-2">
                                    <span className="text-xs font-medium">
                                        {c.author_name}
                                    </span>
                                    <When
                                        iso={c.created_at}
                                        className="text-[11px] text-muted-foreground"
                                    />
                                </div>
                                <p className="text-sm wrap-break-word whitespace-pre-line">
                                    {c.body}
                                </p>
                            </div>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={() => deleteComment(c.id)}
                                    className="self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
                                    aria-label="Delete comment"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                    {!readOnly && (
                        <form onSubmit={send} className="flex items-end gap-2">
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        send(e);
                                    }
                                }}
                                placeholder="Write a comment…"
                                rows={1}
                                maxLength={1000}
                                className="min-h-10 resize-none"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="size-10 shrink-0"
                                disabled={sending || !comment.trim()}
                            >
                                <Send />
                            </Button>
                        </form>
                    )}
                </section>

                {history.length > 0 && (
                    <section className="space-y-3">
                        <h3 className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            <History className="size-3.5" /> History
                        </h3>
                        <ol className="space-y-2 border-l pl-4">
                            {history.map((h) => (
                                <li key={h.id} className="text-xs">
                                    <span className="font-medium text-foreground">
                                        {h.actor_name}
                                    </span>{' '}
                                    <span className="text-muted-foreground">
                                        {h.description} ·{' '}
                                        <When iso={h.created_at} />
                                    </span>
                                    <DeviceLine
                                        device={h.device}
                                        tag={h.device_tag}
                                        trail={h.device_trail}
                                    />
                                </li>
                            ))}
                        </ol>
                    </section>
                )}
            </div>
        </div>
    );
}

function Row({
    memberId,
    label,
    right,
    muted,
    onEdit,
}: {
    memberId: number;
    label: string;
    right: string;
    muted?: boolean;
    onEdit?: () => void;
}) {
    const { member } = useGroup();

    return (
        <div className="flex items-center gap-3">
            <MemberAvatar member={member(memberId)} size="sm" />
            <span className="flex-1 truncate text-sm">{label}</span>
            <span
                className={cn(
                    'tabular text-sm',
                    muted && 'text-xs text-muted-foreground italic',
                )}
            >
                {right}
            </span>
            {onEdit && (
                <button
                    type="button"
                    onClick={onEdit}
                    className="-mr-1 rounded-md p-1 text-muted-foreground transition-colors hover:text-primary"
                    aria-label={`Set ${member(memberId)?.name ?? 'their'}'s share`}
                >
                    <Pencil className="size-3.5" />
                </button>
            )}
        </div>
    );
}
