<?php

namespace App\Services;

/**
 * Collapses net balances into the fewest possible transfers. Every person's
 * net position is preserved.
 *
 * The minimum is (people with a balance) − (most groups they split into whose
 * balances sum to zero), since each such group settles alone in size − 1
 * transfers. Those groups are found exactly with a dynamic program over
 * subsets; each group is then settled by matching the biggest debtor with the
 * biggest creditor. Past MAX_EXACT people the subset search gets too slow, so
 * the matching runs on everyone at once (at most n − 1 transfers).
 */
class DebtSimplifier
{
    private const MAX_EXACT = 14;

    /**
     * @param  array<int, int>  $net  member id => net balance (positive = is owed)
     * @return list<array{from: int, to: int, amount: int}>
     */
    public function simplify(array $net): array
    {
        $net = array_filter($net, fn (int $v) => $v !== 0);
        ksort($net);

        if (count($net) > self::MAX_EXACT) {
            return $this->greedy($net);
        }

        $transfers = [];

        foreach ($this->zeroSumGroups($net) as $group) {
            array_push($transfers, ...$this->greedy($group));
        }

        return $transfers;
    }

    /**
     * Split the balances into as many zero-sum groups as possible.
     *
     * @param  array<int, int>  $net
     * @return list<array<int, int>>
     */
    private function zeroSumGroups(array $net): array
    {
        $ids = array_keys($net);
        $values = array_values($net);
        $count = count($values);
        $full = (1 << $count) - 1;
        $bitIndex = array_flip(array_map(fn (int $i) => 1 << $i, array_keys($values)));

        // $sum[$mask]: total balance of the subset; $most[$mask]: most zero-sum groups it splits into.
        $sum = [0];
        $most = [0];

        for ($mask = 1; $mask <= $full; $mask++) {
            $low = $mask & -$mask;
            $sum[$mask] = $sum[$mask ^ $low] + $values[$bitIndex[$low]];

            $best = 0;

            for ($i = 0; $i < $count; $i++) {
                if ($mask & (1 << $i)) {
                    $best = max($best, $most[$mask ^ (1 << $i)]);
                }
            }

            $most[$mask] = $best + ($sum[$mask] === 0 ? 1 : 0);
        }

        // Walk back from everyone, peeling off one person at a time along an
        // optimal path. Each time the people left sum to zero, the ones peeled
        // off since the last such point form a group.
        $groups = [];
        $group = [];

        for ($mask = $full; $mask > 0;) {
            if ($sum[$mask] === 0 && $group !== []) {
                $groups[] = $group;
                $group = [];
            }

            $target = $most[$mask] - ($sum[$mask] === 0 ? 1 : 0);

            for ($i = 0; $i < $count; $i++) {
                if ($mask & (1 << $i) && $most[$mask ^ (1 << $i)] === $target) {
                    $group[$ids[$i]] = $values[$i];
                    $mask ^= 1 << $i;
                    break;
                }
            }
        }

        if ($group !== []) {
            $groups[] = $group;
        }

        return $groups;
    }

    /**
     * Repeatedly match the biggest debtor with the biggest creditor.
     *
     * @param  array<int, int>  $net
     * @return list<array{from: int, to: int, amount: int}>
     */
    private function greedy(array $net): array
    {
        $creditors = array_filter($net, fn (int $v) => $v > 0);
        $debtors = array_map(fn (int $v) => -$v, array_filter($net, fn (int $v) => $v < 0));

        $transfers = [];

        while ($creditors !== [] && $debtors !== []) {
            arsort($creditors);
            arsort($debtors);

            $creditor = array_key_first($creditors);
            $debtor = array_key_first($debtors);
            $amount = min($creditors[$creditor], $debtors[$debtor]);

            $transfers[] = ['from' => $debtor, 'to' => $creditor, 'amount' => $amount];

            $creditors[$creditor] -= $amount;
            $debtors[$debtor] -= $amount;

            if ($creditors[$creditor] === 0) {
                unset($creditors[$creditor]);
            }

            if ($debtors[$debtor] === 0) {
                unset($debtors[$debtor]);
            }
        }

        return $transfers;
    }
}
