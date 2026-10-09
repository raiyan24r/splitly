import type { SVGAttributes } from 'react';

/** Two overlapping coins: a bill split in two. */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="16" r="9" fillOpacity="0.55" />
            <circle cx="20" cy="16" r="9" />
        </svg>
    );
}
