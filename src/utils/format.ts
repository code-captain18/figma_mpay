/** Formats a number as Ghana cedis: GH₵1,234.50 */
export function formatGHS(amount: number): string {
    const n = Number(amount);
    return `GH\u20B5${(isNaN(n) ? 0 : n).toFixed(2)}`;
}
