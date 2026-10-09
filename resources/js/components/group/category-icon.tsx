import {
    Bus,
    Car,
    Film,
    Fuel,
    Gift,
    HeartPulse,
    Home,
    Hotel,
    Lightbulb,
    type LucideIcon,
    Plane,
    Receipt,
    ShoppingBag,
    ShoppingCart,
    Utensils,
    Wine,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const categories: Record<
    string,
    { icon: LucideIcon; label: string; tint: string }
> = {
    general: { icon: Receipt, label: 'General', tint: '#a1a1aa' },
    food: { icon: Utensils, label: 'Food', tint: '#fb923c' },
    groceries: { icon: ShoppingCart, label: 'Groceries', tint: '#a3e635' },
    drinks: { icon: Wine, label: 'Drinks', tint: '#f472b6' },
    transport: { icon: Bus, label: 'Transport', tint: '#60a5fa' },
    fuel: { icon: Fuel, label: 'Fuel', tint: '#fbbf24' },
    travel: { icon: Plane, label: 'Travel', tint: '#22d3ee' },
    stay: { icon: Hotel, label: 'Stay', tint: '#a78bfa' },
    rent: { icon: Home, label: 'Rent', tint: '#34d399' },
    utilities: { icon: Lightbulb, label: 'Utilities', tint: '#facc15' },
    shopping: { icon: ShoppingBag, label: 'Shopping', tint: '#e879f9' },
    entertainment: { icon: Film, label: 'Fun', tint: '#f87171' },
    health: { icon: HeartPulse, label: 'Health', tint: '#fb7185' },
    gifts: { icon: Gift, label: 'Gifts', tint: '#c084fc' },
    other: { icon: Car, label: 'Other', tint: '#94a3b8' },
};

export function categoryLabel(category: string): string {
    return categories[category]?.label ?? category;
}

export function CategoryIcon({
    category,
    className,
}: {
    category: string;
    className?: string;
}) {
    const { icon: Icon, tint } = categories[category] ?? categories.general;

    return (
        <span
            className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center rounded-xl',
                className,
            )}
            style={{ backgroundColor: `${tint}1a`, color: tint }}
        >
            <Icon className="size-[18px]" />
        </span>
    );
}
