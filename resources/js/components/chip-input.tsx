import { X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Type a name and press Enter (or comma) to add it as a chip.
 */
export function ChipInput({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}) {
    const [draft, setDraft] = useState('');

    const commit = () => {
        const names = draft
            .split(',')
            .map((n) => n.trim())
            .filter(Boolean)
            .filter(
                (n) => !value.some((v) => v.toLowerCase() === n.toLowerCase()),
            );

        if (names.length > 0) {
            onChange([...value, ...names]);
        }

        setDraft('');
    };

    return (
        <div
            className={cn(
                'flex min-h-11 flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50',
                className,
            )}
        >
            {value.map((name) => (
                <span
                    key={name}
                    className="animate-pop-in flex items-center gap-1 rounded-full bg-primary/15 py-0.5 pr-1 pl-2.5 text-sm text-primary"
                >
                    {name}
                    <button
                        type="button"
                        onClick={() =>
                            onChange(value.filter((v) => v !== name))
                        }
                        className="rounded-full p-0.5 hover:bg-primary/20"
                        aria-label={`Remove ${name}`}
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
            <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        commit();
                    } else if (
                        e.key === 'Backspace' &&
                        !draft &&
                        value.length
                    ) {
                        onChange(value.slice(0, -1));
                    }
                }}
                onBlur={commit}
                placeholder={value.length ? '' : placeholder}
                className="min-w-32 flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
        </div>
    );
}
