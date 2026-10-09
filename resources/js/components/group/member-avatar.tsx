import { cn } from '@/lib/utils';
import type { Member } from '@/types/group';

const sizes = {
    xs: 'size-5 text-[9px]',
    sm: 'size-7 text-[11px]',
    md: 'size-9 text-xs',
    lg: 'size-12 text-base',
};

export function initials(name: string): string {
    const parts = name.trim().split(/\s+/);

    return (
        (parts[0]?.[0] ?? '') + (parts.length > 1 ? parts.at(-1)![0] : '')
    ).toUpperCase();
}

export function MemberAvatar({
    member,
    size = 'md',
    className,
}: {
    member: Pick<Member, 'name' | 'color'> | undefined;
    size?: keyof typeof sizes;
    className?: string;
}) {
    const color = member?.color ?? '#71717a';

    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight select-none',
                sizes[size],
                className,
            )}
            style={{
                backgroundColor: `${color}26`,
                color,
                boxShadow: `inset 0 0 0 1px ${color}40`,
            }}
            title={member?.name}
        >
            {member ? initials(member.name) : '?'}
        </span>
    );
}
