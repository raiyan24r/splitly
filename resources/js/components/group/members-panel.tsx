import { router } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import MemberController from '@/actions/App/Http/Controllers/MemberController';
import { useGroup } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Balances, Member } from '@/types/group';

export function MembersPanel({ balances }: { balances: Balances }) {
    const { group, activeMembers, me, money, readOnly } = useGroup();
    const [name, setName] = useState('');
    const [error, setError] = useState<string>();

    const add = (event: React.FormEvent) => {
        event.preventDefault();

        if (!name.trim()) {
            return;
        }

        router.post(
            MemberController.store.url(group.slug),
            { name },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setName('');
                    setError(undefined);
                },
                onError: (errors) => setError(errors.name),
            },
        );
    };

    return (
        <div className="space-y-6">
            {!readOnly && (
                <form onSubmit={add} className="space-y-1">
                    <div className="flex gap-2">
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Add someone by name and press Enter"
                            maxLength={60}
                            className="h-11 rounded-xl"
                        />
                        <Button
                            type="submit"
                            className="h-11 rounded-xl"
                            disabled={!name.trim()}
                        >
                            <Plus /> Add
                        </Button>
                    </div>
                    <InputError message={error} />
                </form>
            )}

            <div className="divide-y rounded-2xl border bg-card">
                {activeMembers.map((m) => (
                    <MemberRow
                        key={m.id}
                        member={m}
                        isMe={m.id === me?.id}
                        balance={balances.net[m.id] ?? 0}
                        money={money}
                        slug={group.slug}
                        readOnly={readOnly}
                    />
                ))}
            </div>

            <p className="text-xs text-muted-foreground">
                People can only be removed once they're settled up. Their past
                expenses stay in the history.
            </p>
        </div>
    );
}

function MemberRow({
    member,
    isMe,
    balance,
    money,
    slug,
    readOnly,
}: {
    member: Member;
    isMe: boolean;
    balance: number;
    money: (minor: number) => string;
    slug: string;
    readOnly: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(member.name);
    const [error, setError] = useState<string>();

    const save = (event: React.FormEvent) => {
        event.preventDefault();

        router.patch(
            MemberController.update.url([slug, member.id]),
            { name },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditing(false);
                    setError(undefined);
                },
                onError: (errors) => setError(errors.name),
            },
        );
    };

    const remove = () => {
        if (confirm(`Remove ${member.name} from the group?`)) {
            router.delete(MemberController.destroy.url([slug, member.id]), {
                preserveScroll: true,
            });
        }
    };

    if (editing) {
        return (
            <form onSubmit={save} className="space-y-1 px-4 py-3">
                <div className="flex items-center gap-2">
                    <MemberAvatar member={member} />
                    <Input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={60}
                        className="h-9"
                    />
                    <Button type="submit" size="icon" aria-label="Save name">
                        <Check />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                            setEditing(false);
                            setName(member.name);
                        }}
                        aria-label="Cancel"
                    >
                        <X />
                    </Button>
                </div>
                <InputError message={error} />
            </form>
        );
    }

    return (
        <div className="group flex items-center gap-3 px-4 py-3">
            <MemberAvatar member={member} />
            <div className="min-w-0 flex-1">
                <div className="truncate font-medium">
                    {member.name}
                    {isMe && (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                            you
                        </span>
                    )}
                </div>
                <div className="text-xs text-muted-foreground">
                    {balance === 0
                        ? 'settled up'
                        : balance > 0
                          ? `gets back ${money(balance)}`
                          : `owes ${money(-balance)}`}
                </div>
            </div>
            {!readOnly && (
                <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(true)}
                        aria-label={`Rename ${member.name}`}
                    >
                        <Pencil />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={remove}
                        disabled={balance !== 0}
                        title={
                            balance !== 0
                                ? 'Settle up before removing'
                                : undefined
                        }
                        aria-label={`Remove ${member.name}`}
                    >
                        <Trash2 />
                    </Button>
                </div>
            )}
        </div>
    );
}
