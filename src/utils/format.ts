/** Formats a number as Ghana cedis: GH₵1,234.50 */
export function formatGHS(amount: number): string {
    return `GH\u20B5${amount.toFixed(2)}`;
}
