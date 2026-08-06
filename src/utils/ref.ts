import * as Crypto from 'expo-crypto';

function randomHex(byteCount: number): string {
    const bytes = Crypto.getRandomBytes(byteCount);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Generates a timestamped transaction reference, e.g. REF-20240101-143522-AB1C2D */
export function genRef(): string {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return (
        `REF-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
        `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${randomHex(3)}`
    );
}

/** Generates a wallet-load reference: WB{timestamp}{8 hex chars} */
export function genWalletRef(): string {
    return `WB${Date.now()}${randomHex(4)}`;
}

/** Generates a transaction reference for web-transaction endpoints: MS{timestamp}{8 hex chars} */
export function genMsRef(): string {
    return `MS${Date.now()}${randomHex(4)}`;
}

/** Generates a bulk-upload reference: BT{unix-seconds-timestamp}-{1-based index} */
export function genBtRef(batchTs: number, index: number): string {
    return `BT${batchTs}-${index}`;
}

