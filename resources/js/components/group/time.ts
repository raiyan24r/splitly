/**
 * Date helpers. Everything is shown in the viewer's local (device) timezone.
 * The server sends instants with an offset and receives them back as full
 * ISO timestamps, so its own timezone never leaks into the UI.
 */

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
];

export function timeAgo(iso: string | null | undefined): string {
    if (!iso) {
        return '';
    }

    const seconds = (new Date(iso).getTime() - Date.now()) / 1000;

    for (const [unit, size] of units) {
        if (Math.abs(seconds) >= size) {
            return rtf.format(Math.round(seconds / size), unit);
        }
    }

    return 'just now';
}

const DAY_ONLY = /^\d{4}-\d{2}(-\d{2})?$/;

/**
 * Accepts a full ISO timestamp, or a plain day/month key ("2026-10-10",
 * "2026-10") which is shown as-is without any timezone shifting.
 */
function format(value: string, options: Intl.DateTimeFormatOptions): string {
    if (DAY_ONLY.test(value)) {
        const [y, m, d = 1] = value.split('-').map(Number);

        return new Intl.DateTimeFormat(undefined, {
            ...options,
            timeZone: 'UTC',
        }).format(new Date(Date.UTC(y, m - 1, d, 12)));
    }

    return new Intl.DateTimeFormat(undefined, { ...options, timeZone }).format(
        new Date(value),
    );
}

/** "Oct 10, 2026" */
export function formatDate(
    value: string,
    options?: Intl.DateTimeFormatOptions,
) {
    return format(value, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options,
    });
}

/** "2:30 PM" */
export function formatTime(iso: string) {
    return format(iso, { hour: 'numeric', minute: '2-digit' });
}

/** "Oct 10, 2026, 2:30 PM" */
export function formatDateTime(iso: string | null | undefined) {
    return iso
        ? format(iso, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          })
        : '';
}

/** "October 2026" for a "2026-10" key. */
export function monthLabel(monthKey: string) {
    return format(monthKey, { month: 'long', year: 'numeric' });
}

/** Wall-clock parts of an instant in the local timezone. */
function parts(date: Date) {
    const values = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        })
            .formatToParts(date)
            .map((p) => [p.type, p.value]),
    );

    return values as Record<
        'year' | 'month' | 'day' | 'hour' | 'minute',
        string
    >;
}

/** "2026-10-10" in the local timezone, for grouping by day. */
export function dayKey(iso: string) {
    const p = parts(new Date(iso));

    return `${p.year}-${p.month}-${p.day}`;
}

/** "2026-10" in the local timezone, for grouping by month. */
export function monthKey(iso: string) {
    return dayKey(iso).slice(0, 7);
}

/**
 * Value for an <input type="datetime-local">: "2026-10-10T14:30" in the local
 * timezone.
 */
export function toDateTimeInput(iso?: string | null) {
    const p = parts(iso ? new Date(iso) : new Date());

    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/**
 * The input's local wall-clock value as a full ISO instant for the server
 * ("2026-10-09T22:30:00.000Z"). Empty or invalid values pass through so
 * server validation can report them.
 */
export function fromDateTimeInput(value: string) {
    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

/** Short zone label for hints, e.g. "GMT+6". */
export function zoneLabel() {
    return (
        new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
            .formatToParts(new Date())
            .find((p) => p.type === 'timeZoneName')?.value ?? timeZone
    );
}
