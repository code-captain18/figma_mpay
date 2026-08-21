import type { PermKey, PermMap, TxRecord } from '@/types';

// ─── Permissions ───────────────────────────────────────────────────────────────
export interface PermSection {
  key: string;
  modules: string[];
  cols: PermKey[];
}

export const PERM_SECTIONS: PermSection[] = [
  { key: 'Airtime', modules: ['purchase', 'bulk'], cols: ['view', 'create', 'approve', 'export', 'delete'] },
  { key: 'Data', modules: ['purchase', 'bulk'], cols: ['view', 'create', 'approve', 'export', 'delete'] },
  { key: 'MoMo', modules: ['send', 'withdraw'], cols: ['view', 'create', 'approve', 'export', 'delete'] },
  { key: 'Reports', modules: ['sales', 'transactions'], cols: ['view', 'export'] },
];

export function makeEmptyPerms(): PermMap {
  const perms: PermMap = {};
  PERM_SECTIONS.forEach(sec => {
    sec.modules.forEach(mod => {
      perms[`${sec.key}:${mod}`] = {
        view: false,
        create: false,
        approve: false,
        export: false,
        delete: false,
      };
    });
  });
  return perms;
}

// ─── Transaction history data ──────────────────────────────────────────────────
export const NETWORKS: { id: string; name: string; color: string }[] = [
  { id: 'mtn', name: 'MTN', color: '#F5A623' },
  { id: 'telecel', name: 'Telecel', color: '#E8334A' },
  { id: 'airteltigo', name: 'AirtelTigo', color: '#1878CE' },
];

// ─── History helpers ───────────────────────────────────────────────────────────
export function groupByDate(txs: TxRecord[]): { label: string; items: TxRecord[] }[] {
  const map = new Map<string, TxRecord[]>();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  for (const tx of txs) {
    const d = new Date(tx.createdAt);
    let key: string;
    if (d.toDateString() === today.toDateString()) {
      key = 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      key = 'Yesterday';
    } else {
      key = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  );
}

export function fmtAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const CSV_HEADER =
  'Reference,Date,Status,Type,Network,Phone,Amount (GHS),Fee (GHS),Net Amount (GHS),Agent ID';

export function buildCsvRow(tx: TxRecord, user: { accountId: string }): string {
  return [
    tx.ref,
    fmtDateTime(tx.createdAt),
    tx.status,
    tx.type,
    tx.network,
    tx.phone,
    tx.amount.toFixed(2),
    tx.fee.toFixed(2),
    (tx.amount - tx.fee).toFixed(2),
    user.accountId,
  ].join(',');
}

