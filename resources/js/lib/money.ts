/**
 * Amounts travel as integers in the currency's minor unit (cents, fils, ...).
 */

export function formatMoney(
    minor: number,
    currency: string,
    exponent: number,
    options: { sign?: boolean; compact?: boolean } = {},
): string {
    const value = minor / 10 ** exponent;
    const formatted = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: options.compact ? 0 : exponent,
        maximumFractionDigits: exponent,
    }).format(Math.abs(value));

    const sign = minor < 0 ? '−' : options.sign && minor > 0 ? '+' : '';

    return `${sign}${currency} ${formatted}`;
}

/** Minor units → plain input string ("12.50"). */
export function toInput(minor: number, exponent: number): string {
    return (minor / 10 ** exponent).toFixed(exponent);
}

/** User input ("12.5") → minor units (1250). Invalid input becomes 0. */
export function toMinor(value: string | number, exponent: number): number {
    const n = typeof value === 'number' ? value : parseFloat(value);

    return Number.isFinite(n) ? Math.round(n * 10 ** exponent) : 0;
}
