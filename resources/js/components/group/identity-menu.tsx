import { ChevronDown, LogOut, Repeat } from 'lucide-react';
import { useGroup, useGroupLogout } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * The "You are …" chip in the group header: switch person or log out.
 */
export function IdentityMenu({ onSwitch }: { onSwitch: () => void }) {
    const { me, isAdmin } = useGroup();
    const logout = useGroupLogout();

    // Non-modal: a modal menu opening a dialog can leave the page unclickable.
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border bg-card py-1 pr-3 pl-1 text-sm transition-colors outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                    <MemberAvatar member={me ?? undefined} size="sm" />
                    <span className="hidden max-w-28 truncate sm:inline">
                        {me ? me.name : 'Who are you?'}
                    </span>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                    <div className="text-xs text-muted-foreground">
                        On this device you are
                    </div>
                    <div className="truncate font-medium">
                        {me ? me.name : 'nobody yet'}
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onSwitch}>
                    <Repeat />
                    {me ? 'Switch person' : 'Pick your name'}
                </DropdownMenuItem>
                {!isAdmin && (
                    <DropdownMenuItem
                        onSelect={logout}
                        className="text-owe focus:text-owe"
                    >
                        <LogOut className="text-owe" />
                        Log out of group
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
