<?php

namespace App\Services;

/**
 * Turns an expense total plus per-member split inputs into exact owed amounts.
 * All amounts are integer minor units, and results always sum to the total.
 */
class SplitCalculator
{
    public const EQUAL = 'equal';

    public const EXACT = 'exact';

    public const PERCENT = 'percent';

    public const SHARES = 'shares';

    public const ADJUSTMENT = 'adjustment';

    public const TYPES = [self::EQUAL, self::EXACT, self::PERCENT, self::SHARES, self::ADJUSTMENT];

    /**
     * Precision used to turn fractional percentages / shares into integer weights.
     */
    private const WEIGHT_SCALE = 10000;

    /**
     * @param  array<int, int|float>  $inputs  member id => input. Ignored for "equal";
     *                                         minor units for "exact"/"adjustment"; numbers for "percent"/"shares".
     * @return array<int, int> member id => owed amount (minor units)
     *
     * @throws SplitException
     */
    public function split(int $total, string $type, array $inputs): array
    {
        if ($total <= 0) {
            throw new SplitException('The amount must be greater than zero.');
        }

        if ($inputs === []) {
            throw new SplitException('Choose at least one person to split with.');
        }

        return match ($type) {
            self::EQUAL => self::allocate($total, array_fill_keys(array_keys($inputs), 1)),
            self::EXACT => $this->exact($total, $inputs),
            self::PERCENT => $this->percent($total, $inputs),
            self::SHARES => $this->shares($total, $inputs),
            self::ADJUSTMENT => $this->adjustment($total, $inputs),
            default => throw new SplitException('Unknown split type.'),
        };
    }

    /**
     * Distribute $total proportionally to integer weights using the largest
     * remainder method. Ties go to whoever comes first, so results are stable.
     *
     * @param  array<int, int>  $weights
     * @return array<int, int>
     */
    public static function allocate(int $total, array $weights): array
    {
        $weights = array_filter($weights, fn (int $w) => $w > 0);
        $sum = (string) array_sum($weights);

        if ($weights === [] || $sum === '0') {
            throw new SplitException('Nothing to split between.');
        }

        $result = [];
        $remainders = [];
        $allocated = 0;

        foreach ($weights as $key => $weight) {
            $product = bcmul((string) $total, (string) $weight);
            $result[$key] = (int) bcdiv($product, $sum, 0);
            $remainders[$key] = bcmod($product, $sum);
            $allocated += $result[$key];
        }

        $order = array_keys($weights);
        $position = array_flip($order);

        usort($order, fn ($a, $b) => bccomp($remainders[$b], $remainders[$a]) ?: $position[$a] <=> $position[$b]);

        for ($i = 0, $left = $total - $allocated; $i < $left; $i++) {
            $result[$order[$i % count($order)]]++;
        }

        return $result;
    }

    /**
     * @param  array<int, int|float>  $inputs
     * @return array<int, int>
     */
    private function exact(int $total, array $inputs): array
    {
        $amounts = array_map(fn ($v) => (int) $v, $inputs);

        foreach ($amounts as $amount) {
            if ($amount < 0) {
                throw new SplitException('Amounts can not be negative.');
            }
        }

        $sum = array_sum($amounts);

        if ($sum !== $total) {
            throw new SplitException('The exact amounts must add up to the total.');
        }

        return array_filter($amounts, fn (int $v) => $v > 0);
    }

    /**
     * @param  array<int, int|float>  $inputs
     * @return array<int, int>
     */
    private function percent(int $total, array $inputs): array
    {
        $weights = $this->weights($inputs);

        if (array_sum($weights) !== 100 * self::WEIGHT_SCALE) {
            throw new SplitException('The percentages must add up to 100%.');
        }

        return self::allocate($total, $weights);
    }

    /**
     * @param  array<int, int|float>  $inputs
     * @return array<int, int>
     */
    private function shares(int $total, array $inputs): array
    {
        $weights = $this->weights($inputs);

        if (array_sum($weights) <= 0) {
            throw new SplitException('Give at least one person a share.');
        }

        return self::allocate($total, $weights);
    }

    /**
     * Everyone splits equally, then each person's adjustment is added on top.
     *
     * @param  array<int, int|float>  $inputs
     * @return array<int, int>
     */
    private function adjustment(int $total, array $inputs): array
    {
        $adjustments = array_map(fn ($v) => (int) $v, $inputs);
        $base = $total - array_sum($adjustments);

        if ($base < 0) {
            throw new SplitException('The adjustments are larger than the total.');
        }

        $equal = $base > 0
            ? self::allocate($base, array_fill_keys(array_keys($adjustments), 1))
            : array_fill_keys(array_keys($adjustments), 0);

        $result = [];

        foreach ($adjustments as $memberId => $adjustment) {
            $result[$memberId] = $equal[$memberId] + $adjustment;

            if ($result[$memberId] < 0) {
                throw new SplitException('An adjustment makes someone owe less than nothing.');
            }
        }

        return array_filter($result, fn (int $v) => $v > 0);
    }

    /**
     * @param  array<int, int|float>  $inputs
     * @return array<int, int>
     */
    private function weights(array $inputs): array
    {
        return array_map(function ($value) {
            if ($value < 0) {
                throw new SplitException('Values can not be negative.');
            }

            return (int) round($value * self::WEIGHT_SCALE);
        }, $inputs);
    }
}
