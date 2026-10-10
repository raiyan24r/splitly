import { router } from '@inertiajs/react';
import { createContext, useContext } from 'react';
import GroupController from '@/actions/App/Http/Controllers/GroupController';
import { formatMoney } from '@/lib/money';
import type { GroupInfo, Member } from '@/types/group';

export type GroupContextValue = {
    group: GroupInfo;
    members: Member[];
    activeMembers: Member[];
    member: (id: number | null | undefined) => Member | undefined;
    me: Member | null;
    setMe: (id: number | null) => void;
    money: (minor: number, options?: { sign?: boolean }) => string;
    isAdmin: boolean;
    readOnly: boolean;
    categories: string[];
};

export const GroupContext = createContext<GroupContextValue | null>(null);

export function useGroup(): GroupContextValue {
    const value = useContext(GroupContext);

    if (!value) {
        throw new Error('useGroup must be used inside a group page');
    }

    return value;
}

/**
 * Log out of the group on this device: locks it again and forgets "who I am".
 * The identity is cleared only after the request, so the audit log still
 * knows who logged out.
 */
export function useGroupLogout() {
    const { group, setMe } = useGroup();

    return () =>
        router.post(
            GroupController.lock.url(group.slug),
            {},
            { onSuccess: () => setMe(null) },
        );
}

export function buildMoney(group: GroupInfo) {
    return (minor: number, options?: { sign?: boolean }) =>
        formatMoney(minor, group.currency, group.exponent, options);
}

/** Display name for a member, marking people who left the group. */
export function displayName(member: Member | undefined, meId?: number | null) {
    if (!member) {
        return 'Someone';
    }

    if (member.id === meId) {
        return `You (${member.name})`;
    }

    return member.removed ? `${member.name} (left)` : member.name;
}
