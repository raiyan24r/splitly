import { ArrowRight, Monitor, Smartphone } from 'lucide-react';
import { Fragment, useState } from 'react';
import { cn } from '@/lib/utils';

const MOBILE = /iPhone|iPad|Android/;

/**
 * "📱 Chrome on iPhone · #7F3A · Alice → +3 → Cara"
 * The trail lists the names this device used in the group, latest last.
 * Long trails show only the first and last name; click to expand inline.
 */
export function DeviceLine({
    device,
    tag,
    trail,
    onTagClick,
    expandable = true,
    className,
}: {
    device: string | null;
    tag: string | null;
    trail: string[];
    onTagClick?: () => void;
    /** Off where the line sits inside another button (no nested buttons). */
    expandable?: boolean;
    className?: string;
}) {
    if (!device && !tag) {
        return null;
    }

    const Icon = device && MOBILE.test(device) ? Smartphone : Monitor;

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground/70',
                className,
            )}
        >
            <Icon className="size-3 shrink-0" />
            {device && <span>{device}</span>}
            {tag &&
                (onTagClick ? (
                    <button
                        type="button"
                        onClick={onTagClick}
                        title="Show everything from this device"
                        className="rounded bg-white/5 px-1 font-mono hover:bg-white/10 hover:text-foreground"
                    >
                        #{tag}
                    </button>
                ) : (
                    <span
                        className="rounded bg-white/5 px-1 font-mono"
                        title="Same tag = same device"
                    >
                        #{tag}
                    </span>
                ))}
            {trail.length > 1 && (
                <>
                    <span>·</span>
                    <Trail trail={trail} expandable={expandable} />
                </>
            )}
        </div>
    );
}

function Trail({
    trail,
    expandable,
}: {
    trail: string[];
    expandable: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const hidden = trail.length - 2;
    const collapsible = hidden > 0;

    const names = (
        <>
            {expanded || !collapsible ? (
                trail.map((name, i) => (
                    <Fragment key={`${name}-${i}`}>
                        {i > 0 && <Arrow />}
                        <Name name={name} current={i === trail.length - 1} />
                    </Fragment>
                ))
            ) : (
                <>
                    <Name name={trail[0]} current={false} />
                    <Arrow />
                    <span className="rounded-full bg-white/8 px-1.5 font-medium text-muted-foreground">
                        +{hidden}
                    </span>
                    <Arrow />
                    <Name name={trail[trail.length - 1]} current />
                </>
            )}
        </>
    );

    if (!collapsible || !expandable) {
        return (
            <span
                className="flex flex-wrap items-center gap-1"
                title={trail.join(' → ')}
            >
                {names}
            </span>
        );
    }

    return (
        <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            title={
                expanded
                    ? 'Show less'
                    : `Names used on this device: ${trail.join(' → ')}`
            }
            className="-mx-1 flex flex-wrap items-center gap-1 rounded px-1 text-left transition-colors hover:bg-white/5"
        >
            {names}
            {expanded && (
                <span className="ml-0.5 text-primary/80">show less</span>
            )}
        </button>
    );
}

function Arrow() {
    return <ArrowRight className="size-2.5 shrink-0" />;
}

function Name({ name, current }: { name: string; current: boolean }) {
    return (
        <span
            className={cn(
                current
                    ? 'font-medium text-amber-400/90'
                    : 'line-through decoration-muted-foreground/40',
            )}
        >
            {name}
        </span>
    );
}
