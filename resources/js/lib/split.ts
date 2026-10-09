import { toMinor } from '@/lib/money';
import type { SplitType } from '@/types/group';

/**
 * Client-side mirror of App\Services\SplitCalculator, used for the live
 * preview. The server recalculates everything on save.
 */

const WEIGHT_SCALE = 10000;

export type SplitResult =
    | { ok: true; amounts: Record<number, number> }
    | {
          ok: false;
          error: string;
          amounts: Record<number, number>;
          /** Exact splits: minor units still to assign (negative = over). */
          remaining?: number;
      };

/** Largest remainder allocation; ties go to whoever comes first. */
export function allocate(
    total: number,
    weights: [number, number][],
): Record<number, number> {
    const positive = weights.filter(([, w]) => w > 0);
    const sum = positive.reduce((s, [, w]) => s + BigInt(w), 0n);
    const result: Record<number, number> = {};

    if (positive.length === 0 || sum === 0n) {
        return result;
    }

    const remainders: [number, bigint, number][] = [];
    let allocated = 0;

    positive.forEach(([id, w], index) => {
        const product = BigInt(total) * BigInt(w);
        result[id] = Number(product / sum);
        remainders.push([id, product % sum, index]);
        allocated += result[id];
    });

    remainders.sort((a, b) =>
        a[1] === b[1] ? a[2] - b[2] : b[1] > a[1] ? 1 : -1,
    );

    for (let i = 0; i < total - allocated; i++) {
        result[remainders[i % remainders.length][0]]++;
    }

    return result;
}

export function calculateSplit(
    total: number,
    type: SplitType,
    rows: { member_id: number; value: string }[],
    exponent: number,
): SplitResult {
    const empty = {};

    if (total <= 0) {
        return { ok: false, error: 'Enter an amount', amounts: empty };
    }

    if (rows.length === 0) {
        return { ok: false, error: 'Pick at least one person', amounts: empty };
    }

    const num = (v: string) => (v === '' ? 0 : Number(v) || 0);

    switch (type) {
        case 'equal':
            return {
                ok: true,
                amounts: allocate(
                    total,
                    rows.map((r) => [r.member_id, 1]),
                ),
            };

        case 'exact': {
            const amounts = Object.fromEntries(
                rows.map((r) => [r.member_id, toMinor(r.value, exponent)]),
            );
            const left =
                total -
                Object.values(amounts).reduce((s: number, v) => s + v, 0);

            return left === 0
                ? { ok: true, amounts }
                : {
                      ok: false,
                      error: left > 0 ? 'left to assign' : 'too much',
                      amounts,
                      remaining: left,
                  };
        }

        case 'percent': {
            const weights = rows.map(
                (r) =>
                    [r.member_id, Math.round(num(r.value) * WEIGHT_SCALE)] as [
                        number,
                        number,
                    ],
            );
            const sum = weights.reduce((s, [, w]) => s + w, 0);
            const amounts = allocate(total, weights);

            return sum === 100 * WEIGHT_SCALE
                ? { ok: true, amounts }
                : {
                      ok: false,
                      error: `${trim((100 * WEIGHT_SCALE - sum) / WEIGHT_SCALE)}% left`,
                      amounts,
                  };
        }

        case 'shares': {
            const weights = rows.map(
                (r) =>
                    [r.member_id, Math.round(num(r.value) * WEIGHT_SCALE)] as [
                        number,
                        number,
                    ],
            );
            const amounts = allocate(total, weights);

            return Object.keys(amounts).length > 0
                ? { ok: true, amounts }
                : { ok: false, error: 'Give someone a share', amounts };
        }

        case 'adjustment': {
            const adjustments = rows.map(
                (r) =>
                    [r.member_id, toMinor(r.value, exponent)] as [
                        number,
                        number,
                    ],
            );
            const base = total - adjustments.reduce((s, [, a]) => s + a, 0);

            if (base < 0) {
                return {
                    ok: false,
                    error: 'Adjustments exceed the total',
                    amounts: empty,
                };
            }

            const equal = allocate(
                base,
                rows.map((r) => [r.member_id, 1]),
            );
            const amounts = Object.fromEntries(
                adjustments.map(([id, a]) => [id, (equal[id] ?? 0) + a]),
            );

            return Object.values(amounts).some((v) => v < 0)
                ? {
                      ok: false,
                      error: 'Someone would owe less than nothing',
                      amounts,
                  }
                : { ok: true, amounts };
        }
    }
}

function trim(n: number): string {
    return String(Math.round(n * 100) / 100);
}
