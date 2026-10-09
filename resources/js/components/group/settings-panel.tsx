import { router } from '@inertiajs/react';
import {
    Check,
    Copy,
    Download,
    LogOut,
    Sparkles,
    UserRound,
} from 'lucide-react';
import ExportController from '@/actions/App/Http/Controllers/ExportController';
import GroupController from '@/actions/App/Http/Controllers/GroupController';
import { useGroup, useGroupLogout } from '@/components/group/group-context';
import { MemberAvatar } from '@/components/group/member-avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useClipboard } from '@/hooks/use-clipboard';

export function SettingsPanel({
    onSwitchIdentity,
}: {
    onSwitchIdentity: () => void;
}) {
    const { group, me, readOnly, isAdmin } = useGroup();
    const [copied, copy] = useClipboard();
    const logout = useGroupLogout();

    return (
        <div className="space-y-3">
            <Card
                icon={<UserRound className="size-5" />}
                title={me ? `You are ${me.name}` : 'You have not picked a name'}
                text="Saved on this device only. Switch if someone else is using it."
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onSwitchIdentity}
                >
                    {me && <MemberAvatar member={me} size="xs" />}
                    Switch
                </Button>
            </Card>

            <Card
                icon={<Sparkles className="size-5 text-primary" />}
                title="Simplify debts"
                text="Combine debts so the group settles with the fewest possible payments. Totals never change."
            >
                <Switch
                    checked={group.simplify_debts}
                    disabled={readOnly}
                    onCheckedChange={(value) =>
                        router.patch(
                            GroupController.updateSettings.url(group.slug),
                            { simplify_debts: value },
                            { preserveScroll: true },
                        )
                    }
                    aria-label="Simplify debts"
                />
            </Card>

            <Card
                icon={<Copy className="size-5" />}
                title="Invite people"
                text="Share the link and the group password. Anyone with both can join."
            >
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copy(group.url)}
                >
                    {copied ? <Check /> : <Copy />}
                    {copied ? 'Copied' : 'Copy link'}
                </Button>
            </Card>

            <Card
                icon={<Download className="size-5" />}
                title="Export"
                text="Download every expense and payment as a CSV spreadsheet."
            >
                <Button variant="secondary" size="sm" asChild>
                    <a href={ExportController.url(group.slug)}>Download</a>
                </Button>
            </Card>

            {!isAdmin && (
                <Card
                    icon={<LogOut className="size-5 text-owe" />}
                    title="Log out"
                    text="Lock the group on this device and forget your name. The password will be asked again."
                >
                    <Button variant="secondary" size="sm" onClick={logout}>
                        Log out
                    </Button>
                </Card>
            )}
        </div>
    );
}

function Card({
    icon,
    title,
    text,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border bg-card px-4 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/4 text-muted-foreground">
                {icon}
            </span>
            <div className="min-w-0 flex-1">
                <div className="font-medium">{title}</div>
                <p className="text-xs text-muted-foreground">{text}</p>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}
