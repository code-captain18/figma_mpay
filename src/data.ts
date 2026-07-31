import type { Assistant, PermMap, PermKey, TxRecord, SvcType } from '@/types';

// ─── Static user / dashboard data ─────────────────────────────────────────────
export const USER = {
  name:          'John Mensah',
  email:         'john.mensah@business.com',
  phone:         '0244 123 456',
  accountId:     'ACC-2024-1234',
  eTopupBalance: 3.05,
  momoBalance:   1.34,
} as const;

export const DASH = {
  airtimeSales:          120.00,
  databundleSales:        85.50,
  mobileMoneyTransfers:  250.00,
} as const;

// ─── Permissions ───────────────────────────────────────────────────────────────
export interface PermSection {
  key:     string;
  modules: string[];
  cols:    PermKey[];
}

export const PERM_SECTIONS: PermSection[] = [
  { key: 'Airtime', modules: ['purchase', 'bulk'],       cols: ['view', 'create', 'approve', 'export', 'delete'] },
  { key: 'Data',    modules: ['purchase', 'bulk'],       cols: ['view', 'create', 'approve', 'export', 'delete'] },
  { key: 'MoMo',   modules: ['send', 'withdraw'],       cols: ['view', 'create', 'approve', 'export', 'delete'] },
  { key: 'Reports', modules: ['sales', 'transactions'],  cols: ['view', 'export'] },
];

export function makeEmptyPerms(): PermMap {
  const perms: PermMap = {};
  PERM_SECTIONS.forEach(sec => {
    sec.modules.forEach(mod => {
      perms[`${sec.key}:${mod}`] = {
        view:    false,
        create:  false,
        approve: false,
        export:  false,
        delete:  false,
      };
    });
  });
  return perms;
}

// ─── Seed data ─────────────────────────────────────────────────────────────────
function seedPerms(grants: Record<string, Partial<Record<PermKey, boolean>>>): PermMap {
  const base = makeEmptyPerms();
  Object.entries(grants).forEach(([key, vals]) => {
    if (base[key]) Object.assign(base[key], vals);
  });
  return base;
}

export const INIT_ASSISTANTS: Assistant[] = [
  {
    id:          'AST0001',
    firstName:   'Ama',
    lastName:    'Asante',
    phoneNumber: '0201 234 567',
    email:       'ama.asante@business.com',
    status:      'active',
    permissions: seedPerms({
      'Airtime:purchase': { view: true, create: true, export: true },
      'Airtime:bulk':     { view: true },
      'Data:purchase':    { view: true, create: true },
      'Reports:sales':    { view: true, export: true },
    }),
    createdAt: '2024-01-15T08:00:00.000Z',
  },
  {
    id:          'AST0002',
    firstName:   'Kwame',
    lastName:    'Boateng',
    phoneNumber: '0554 987 654',
    email:       'kwame.b@business.com',
    status:      'inactive',
    permissions: seedPerms({
      'MoMo:send':         { view: true, create: true },
      'Reports:sales':     { view: true },
      'Reports:transactions': { view: true },
    }),
    createdAt: '2024-03-22T10:30:00.000Z',
  },
];

// ─── Transaction history data ──────────────────────────────────────────────────
export const NETWORKS: { id: string; name: string; color: string }[] = [
  { id: 'mtn',        name: 'MTN',        color: '#F5A623' },
  { id: 'telecel',    name: 'Telecel',    color: '#E8334A' },
  { id: 'airteltigo', name: 'AirtelTigo', color: '#1878CE' },
];

export const TXNS: TxRecord[] = [
  { id:'T001', ref:'MPY-20260730-00125', createdAt:'2026-07-30T09:15:00.000Z', status:'success', type:'data',    network:'mtn',        phone:'233244123456', amount:5.00,   fee:0.05, bundle:'1GB Daily Bundle' },
  { id:'T002', ref:'MPY-20260730-00124', createdAt:'2026-07-30T08:00:00.000Z', status:'success', type:'airtime', network:'telecel',    phone:'233203456789', amount:10.00,  fee:0.10 },
  { id:'T003', ref:'MPY-20260730-00123', createdAt:'2026-07-30T07:05:00.000Z', status:'failed',  type:'airtime', network:'airteltigo', phone:'233571234567', amount:2.00,   fee:0.00 },
  { id:'T004', ref:'MPY-20260729-00122', createdAt:'2026-07-29T17:00:00.000Z', status:'success', type:'data',    network:'mtn',        phone:'233244123456', amount:20.00,  fee:0.20, bundle:'5GB Weekly Bundle' },
  { id:'T005', ref:'MPY-20260729-00121', createdAt:'2026-07-29T14:30:00.000Z', status:'success', type:'data',    network:'telecel',    phone:'233203456789', amount:8.00,   fee:0.08, bundle:'2GB Monthly Bundle' },
  { id:'T006', ref:'MPY-20260729-00120', createdAt:'2026-07-29T10:00:00.000Z', status:'success', type:'airtime', network:'mtn',        phone:'233244123456', amount:5.00,   fee:0.05 },
  { id:'T007', ref:'MPY-20260728-00119', createdAt:'2026-07-28T16:20:00.000Z', status:'success', type:'airtime', network:'airteltigo', phone:'233571234567', amount:5.00,   fee:0.05 },
  { id:'T008', ref:'MPY-20260728-00118', createdAt:'2026-07-28T09:45:00.000Z', status:'failed',  type:'airtime', network:'telecel',    phone:'233203456789', amount:5.00,   fee:0.00 },
  { id:'T009', ref:'MPY-20260727-00117', createdAt:'2026-07-27T15:30:00.000Z', status:'success', type:'momo',    network:'mtn',        phone:'233244123456', amount:50.00,  fee:0.50, momoType:'send' },
  { id:'T010', ref:'MPY-20260727-00116', createdAt:'2026-07-27T11:00:00.000Z', status:'success', type:'data',    network:'airteltigo', phone:'233571234567', amount:12.00,  fee:0.12, bundle:'3GB Weekly Bundle' },
  { id:'T011', ref:'MPY-20260726-00115', createdAt:'2026-07-26T18:45:00.000Z', status:'pending', type:'bulk',    network:'mtn',        phone:'233244123456', amount:100.00, fee:1.00 },
  { id:'T012', ref:'MPY-20260726-00114', createdAt:'2026-07-26T14:20:00.000Z', status:'success', type:'airtime', network:'mtn',        phone:'233244123456', amount:3.00,   fee:0.03 },
  { id:'T013', ref:'MPY-20260726-00113', createdAt:'2026-07-26T10:10:00.000Z', status:'success', type:'data',    network:'telecel',    phone:'233203456789', amount:25.00,  fee:0.25, bundle:'10GB Monthly Bundle' },
  { id:'T014', ref:'MPY-20260725-00112', createdAt:'2026-07-25T16:00:00.000Z', status:'failed',  type:'momo',    network:'mtn',        phone:'233244123456', amount:200.00, fee:0.00, momoType:'withdraw' },
  { id:'T015', ref:'MPY-20260725-00111', createdAt:'2026-07-25T12:30:00.000Z', status:'success', type:'airtime', network:'airteltigo', phone:'233571234567', amount:7.00,   fee:0.07 },
  { id:'T016', ref:'MPY-20260724-00110', createdAt:'2026-07-24T19:00:00.000Z', status:'success', type:'data',    network:'mtn',        phone:'233244123456', amount:15.00,  fee:0.15, bundle:'5GB Daily Bundle' },
  { id:'T017', ref:'MPY-20260724-00109', createdAt:'2026-07-24T13:45:00.000Z', status:'success', type:'airtime', network:'telecel',    phone:'233203456789', amount:20.00,  fee:0.20 },
  { id:'T018', ref:'MPY-20260724-00108', createdAt:'2026-07-24T09:00:00.000Z', status:'success', type:'fibre',   network:'airteltigo', phone:'233571234567', amount:80.00,  fee:0.80 },
  { id:'T019', ref:'MPY-20260723-00107', createdAt:'2026-07-23T17:30:00.000Z', status:'success', type:'momo',    network:'mtn',        phone:'233244123456', amount:150.00, fee:1.50, momoType:'cashin', accountId:'ACC-MOB-7823' },
  { id:'T020', ref:'MPY-20260723-00106', createdAt:'2026-07-23T11:15:00.000Z', status:'success', type:'data',    network:'telecel',    phone:'233203456789', amount:8.00,   fee:0.08, bundle:'1GB Daily Bundle' },
  { id:'T021', ref:'MPY-20260722-00105', createdAt:'2026-07-22T16:00:00.000Z', status:'failed',  type:'airtime', network:'mtn',        phone:'233244123456', amount:10.00,  fee:0.00 },
  { id:'T022', ref:'MPY-20260722-00104', createdAt:'2026-07-22T10:30:00.000Z', status:'success', type:'bulk',    network:'airteltigo', phone:'233571234567', amount:250.00, fee:2.50 },
  { id:'T023', ref:'MPY-20260721-00103', createdAt:'2026-07-21T14:00:00.000Z', status:'success', type:'airtime', network:'telecel',    phone:'233203456789', amount:5.00,   fee:0.05 },
  { id:'T024', ref:'MPY-20260721-00102', createdAt:'2026-07-21T09:00:00.000Z', status:'success', type:'data',    network:'mtn',        phone:'233244123456', amount:35.00,  fee:0.35, bundle:'20GB Monthly Bundle' },
  { id:'T025', ref:'MPY-20260720-00101', createdAt:'2026-07-20T15:30:00.000Z', status:'success', type:'momo',    network:'mtn',        phone:'233244123456', amount:500.00, fee:5.00, momoType:'send' },
];

// ─── History helpers ───────────────────────────────────────────────────────────
export function groupByDate(txs: TxRecord[]): { label: string; items: TxRecord[] }[] {
  const map = new Map<string, TxRecord[]>();
  const today     = new Date();
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
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const CSV_HEADER =
  'Reference,Date,Status,Type,Network,Phone,Amount (GH₵),Fee (GH₵),Net Amount (GH₵),Agent ID';

export function buildCsvRow(tx: TxRecord, user: typeof USER): string {
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

