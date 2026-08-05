/** Generates a timestamped transaction reference, e.g. REF-20240101-143522-AB1C2D */
export function genRef(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const r = Math.random().toString(36).slice(2, 8).toUpperCase();
    return (
        `REF-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
        `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${r}`
    );
}

/** Generates a wallet-load reference in the format required by the API: WB{timestamp}{4-digit random} */
export function genWalletRef(): string {
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `WB${Date.now()}${rand}`;
}

