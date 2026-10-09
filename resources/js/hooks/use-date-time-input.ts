import { useEffect, useState } from 'react';
import { toDateTimeInput } from '@/components/group/time';

/**
 * State for an <input type="datetime-local">. With an existing timestamp it
 * shows that. Without one it shows the current local time and keeps
 * following the clock until the user picks a value themselves.
 */
export function useDateTimeInput(
    iso?: string | null,
): [string, (value: string) => void] {
    const [value, setValue] = useState(() => toDateTimeInput(iso));
    const [touched, setTouched] = useState(Boolean(iso));

    useEffect(() => {
        if (touched) {
            return;
        }

        const id = setInterval(() => setValue(toDateTimeInput()), 10_000);

        return () => clearInterval(id);
    }, [touched]);

    const set = (next: string) => {
        setTouched(true);
        setValue(next);
    };

    return [value, set];
}
