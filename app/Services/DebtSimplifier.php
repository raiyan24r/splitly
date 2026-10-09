<?php

namespace App\Services;

/**
 * Collapses net balances into the fewest practical transfers by repeatedly
 * matching the biggest debtor with the biggest creditor. Every person's net
 * position is preserved and at most n-1 transfers are produced.
 */
class DebtSimplifier
{
    /**
     * @param  array<int, int>  $net  member id => net balance (positive = is owed)
     * @return list<array{from: int, to: int, amount: int}>
     */
    public function simplify(array $net): array
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
