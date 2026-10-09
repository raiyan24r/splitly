import { formatDateTime, timeAgo, zoneLabel } from '@/components/group/time';

/**
 * Exact date & time in the app timezone, e.g. "Oct 10, 2026, 2:30 PM",
 * optionally followed by "· 2 minutes ago". Hover shows the zone.
 */
export function When({
    iso,
    relative = true,
    className,
}: {
    iso: string | null | undefined;
    relative?: boolean;
    className?: string;
}) {
    if (!iso) {
        return null;
    }

    return (
        <time
            dateTime={iso}
            title={`${formatDateTime(iso)} (${zoneLabel()})`}
            className={className}
        >
            {formatDateTime(iso)}
            {relative && ` · ${timeAgo(iso)}`}
        </time>
    );
}
