/** Formats a number as Ghana cedis: GHS 1,234.50 */
export function formatGHS(amount: number): string {
    const n = Number(amount);
    const safe = isNaN(n) ? 0 : n;
    return `GHS ${safe.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
