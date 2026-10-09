import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** "VAT [5] % [+ Add VAT]": hands the entered rate to onApply in one click. */
export function VatControl({
    onApply,
    disabled,
    className,
}: {
    onApply: (rate: number) => void;
    disabled?: boolean;
    className?: string;
}) {
    const [vat, setVat] = useState('5');
    const rate = Number(vat);

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="text-xs text-muted-foreground">VAT</span>
            <div className="relative">
                <Input
                    value={vat}
                    onChange={(e) =>
                        setVat(e.target.value.replace(/[^0-9.]/g, ''))
                    }
                    inputMode="decimal"
                    placeholder="5"
                    aria-label="VAT percentage"
                    className="tabular h-8 w-16 pr-6 text-right"
                />
                <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
                    %
                </span>
            </div>
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onApply(rate)}
                disabled={disabled || !(rate > 0)}
            >
                <Plus />
                Add VAT
            </Button>
        </div>
    );
}
