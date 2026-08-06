import { apiCheckTransactionStatus } from '@/api';

/** Polls the transaction-report endpoint until success/failed or timeout. */
export function pollTransactionStatus(referenceId: string, timeoutMs = 120_000): Promise<void> {
    return new Promise((resolve, reject) => {
        const t0 = Date.now();
        const check = async () => {
            const elapsed = Date.now() - t0;
            if (elapsed >= timeoutMs) { reject(new Error('Transaction timed out. Please check your transaction history.')); return; }
            try {
                const r = await apiCheckTransactionStatus(referenceId);
                if (r.status === 'success') { resolve(); return; }
                if (r.status === 'failed') { reject(new Error(r.entry?.Message ?? 'Transaction failed.')); return; }
            } catch { /* network error — retry */ }
            setTimeout(check, elapsed < 30_000 ? 2_000 : 5_000);
        };
        check();
    });
}
