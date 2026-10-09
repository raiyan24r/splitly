import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from its previous value to the new one.
 */
export function CountUp({
    value,
    format,
    duration = 600,
}: {
    value: number;
    format: (value: number) => string;
    duration?: number;
}) {
    const [display, setDisplay] = useState(0);
    const from = useRef(0);

    useEffect(() => {
        const start = performance.now();
        const initial = from.current;
        let frame = 0;

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const current = Math.round(initial + (value - initial) * eased);

            setDisplay(current);
            from.current = current;

            if (t < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [value, duration]);

    return <span className="tabular">{format(display)}</span>;
}
