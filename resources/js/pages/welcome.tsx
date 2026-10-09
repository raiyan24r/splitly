import { Head, Link, usePage } from '@inertiajs/react';
import { Link2, LockKeyhole, Scale, Sparkles } from 'lucide-react';
import { login } from '@/routes';
import { index as adminGroups } from '@/routes/admin/groups';

const features = [
    {
        icon: Link2,
        title: 'A private link',
        text: 'Each group lives at its own random URL.',
    },
    {
        icon: LockKeyhole,
        title: 'Just a password',
        text: 'No accounts, no emails, no invites.',
    },
    {
        icon: Scale,
        title: 'Every way to split',
        text: 'Equally, exact, %, shares or adjustments.',
    },
    {
        icon: Sparkles,
        title: 'Simplified debts',
        text: 'Settle up in the fewest payments.',
    },
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Split bills with friends" />

            <div className="glow flex min-h-svh flex-col">
                <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
                    <span className="text-lg font-semibold tracking-tight">
                        <span className="text-primary">split</span>ly
                    </span>
                    <Link
                        href={auth.user ? adminGroups() : login()}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        {auth.user ? 'Admin' : 'Admin login'}
                    </Link>
                </header>

                <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 pb-24">
                    <div className="animate-pop-in max-w-2xl space-y-6">
                        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
                            Split bills,
                            <br />
                            <span className="text-primary">
                                not friendships.
                            </span>
                        </h1>
                        <p className="max-w-lg text-lg text-muted-foreground">
                            Track shared expenses, see who owes whom, and settle
                            up with the fewest payments. Got a group link? Open
                            it and enter the password.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {features.map(({ icon: Icon, title, text }) => (
                            <div
                                key={title}
                                className="rounded-2xl border bg-card/60 p-5 backdrop-blur"
                            >
                                <Icon className="size-5 text-primary" />
                                <div className="mt-4 font-medium">{title}</div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </>
    );
}
