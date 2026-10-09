<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Support\Money;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Download every expense and payment as a spreadsheet-friendly CSV,
     * with one column per member showing their net effect.
     */
    public function __invoke(Group $group): StreamedResponse
    {
        $members = $group->members()->withTrashed()->get();
        $currency = $group->currency;
        $filename = Str::slug($group->name).'-'.now()->toDateString().'.csv';

        return response()->streamDownload(function () use ($group, $members, $currency) {
            $out = fopen('php://output', 'w');

            if ($out === false) {
                throw new RuntimeException('Could not open the output stream.');
            }

            fputcsv($out, ['Date & time ('.config('app.timezone').')', 'Description', 'Category', 'Cost', 'Currency', ...$members->pluck('name')->all()]);

            $rows = collect();

            foreach ($group->expenses()->with('payers', 'splits')->get() as $expense) {
                $effect = [];

                foreach ($expense->payers as $p) {
                    $effect[$p->member_id] = ($effect[$p->member_id] ?? 0) + $p->amount;
                }

                foreach ($expense->owedShares() as $memberId => $owed) {
                    $effect[$memberId] = ($effect[$memberId] ?? 0) - $owed;
                }

                $rows->push([$expense->spent_at->format('Y-m-d H:i'), $expense->description, $expense->category, $expense->amount, $effect]);
            }

            foreach ($group->payments()->get() as $payment) {
                $rows->push([$payment->paid_at->format('Y-m-d H:i'), 'Payment', 'payment', $payment->amount, [
                    $payment->from_member_id => $payment->amount,
                    $payment->to_member_id => -$payment->amount,
                ]]);
            }

            foreach ($rows->sortBy(0) as [$date, $description, $category, $amount, $effect]) {
                fputcsv($out, [
                    $date,
                    $description,
                    $category,
                    Money::toDecimal($amount, $currency),
                    $currency,
                    ...$members->map(fn ($m) => Money::toDecimal($effect[$m->id] ?? 0, $currency))->all(),
                ]);
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
