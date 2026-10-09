<?php

namespace App\Support;

/**
 * Amounts are stored as integers in the currency's minor unit (e.g. fils, cents).
 */
class Money
{
    /**
     * Currencies offered when creating a group.
     */
    public const CURRENCIES = [
        'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'USD', 'EUR', 'GBP',
        'INR', 'PKR', 'BDT', 'LKR', 'NPR', 'EGP', 'JOD', 'TRY', 'CAD',
        'AUD', 'NZD', 'SGD', 'MYR', 'IDR', 'PHP', 'THB', 'JPY', 'KRW',
        'CNY', 'HKD', 'CHF', 'SEK', 'NOK', 'DKK', 'ZAR', 'NGN', 'KES', 'BRL', 'MXN',
    ];

    private const ZERO_DECIMAL = ['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'UGX', 'IDR'];

    private const THREE_DECIMAL = ['KWD', 'BHD', 'OMR', 'JOD', 'TND', 'LYD', 'IQD'];

    public static function exponent(string $currency): int
    {
        return match (true) {
            in_array($currency, self::ZERO_DECIMAL, true) => 0,
            in_array($currency, self::THREE_DECIMAL, true) => 3,
            default => 2,
        };
    }

    /**
     * Convert a user-entered decimal amount ("12.50") into minor units (1250).
     */
    public static function toMinor(string|int|float|null $value, string $currency): int
    {
        if ($value === null || $value === '') {
            return 0;
        }

        return (int) round((float) $value * (10 ** self::exponent($currency)));
    }

    /**
     * Convert minor units back into a plain decimal string ("12.50").
     */
    public static function toDecimal(int $minor, string $currency): string
    {
        $exponent = self::exponent($currency);

        return number_format($minor / (10 ** $exponent), $exponent, '.', '');
    }

    public static function format(int $minor, string $currency): string
    {
        $exponent = self::exponent($currency);

        return $currency.' '.number_format($minor / (10 ** $exponent), $exponent);
    }
}
