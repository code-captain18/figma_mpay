import type { Assistant, PermMap, PermKey } from '@/types';

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
