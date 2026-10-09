import { Form, Head } from '@inertiajs/react';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import GroupController from '@/actions/App/Http/Controllers/GroupController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    group: { name: string; slug: string };
};

export default function GroupUnlock({ group }: Props) {
    return (
        <>
            <Head title={group.name} />

            <div className="glow flex min-h-svh items-center justify-center px-6">
                <div className="animate-pop-in w-full max-w-sm space-y-8">
                    <div className="space-y-4 text-center">
                        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                            <LockKeyhole className="size-6" />
                        </span>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-primary">
                                splitly
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                                {group.name}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Enter the group password to continue.
                            </p>
                        </div>
                    </div>

                    <Form
                        {...GroupController.unlock.form(group.slug)}
                        resetOnError={['password']}
                        className="space-y-3"
                    >
                        {({ processing, errors }) => (
                            <>
                                <PasswordInput
                                    name="password"
                                    autoFocus
                                    required
                                    autoComplete="current-password"
                                    placeholder="Group password"
                                    className="h-12 rounded-xl text-base"
                                />
                                <InputError message={errors.password} />
                                <Button
                                    type="submit"
                                    className="h-12 w-full rounded-xl text-base"
                                    disabled={processing}
                                >
                                    {processing ? <Spinner /> : null}
                                    Open group
                                    <ArrowRight />
                                </Button>
                            </>
                        )}
                    </Form>

                    <p className="text-center text-xs text-muted-foreground">
                        This device will remember the group until you lock it.
                    </p>
                </div>
            </div>
        </>
    );
}
