import type { SvcBundle } from '@/types';

// ─── Gradient definitions ──────────────────────────────────────────────────────
export interface GradientDef {
  colors: [string, string, string];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export const GRADIENTS = {
  wallet: {
    colors: ['#4BAEE8', '#1878CE', '#052D6E'] as [string, string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  green: {
    colors: ['#2DD4A0', '#0DA870', '#0A6B47'] as [string, string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  purple: {
    colors: ['#A47EFF', '#7C5CFC', '#4B2FC5'] as [string, string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  orange: {
    colors: ['#FFB347', '#E9910A', '#C16A00'] as [string, string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  momo: {
    colors: ['#2DD4A0', '#0DA870', '#056644'] as [string, string, string],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} satisfies Record<string, GradientDef>;

// ─── Reference generator ──────────────────────────────────────────────────────
export function genRef(): string {
  return 'MP' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ─── Data bundles (flat, for services screen) ─────────────────────────────────
export const SVC_DATA_BUNDLES: SvcBundle[] = [
  { id: 'sb1', label: '100MB · 1 day',   price: 1.00 },
  { id: 'sb2', label: '500MB · 1 day',   price: 3.50 },
  { id: 'sb3', label: '1GB · 1 day',     price: 5.00 },
  { id: 'sb4', label: '2GB · 7 days',    price: 12.00, tag: 'Popular' },
  { id: 'sb5', label: '5GB · 30 days',   price: 30.00 },
  { id: 'sb6', label: '10GB · 30 days',  price: 50.00, tag: 'Best Value' },
];

// ─── Fibre broadband ──────────────────────────────────────────────────────────
export const FIBRE_PROVIDERS = ['Vodafone', 'Surfline', 'Busy', 'Comsys'];

export const FIBRE_BUNDLES: SvcBundle[] = [
  { id: 'fb1', label: '10 Mbps · 30 days',  price: 120.00 },
  { id: 'fb2', label: '25 Mbps · 30 days',  price: 200.00 },
  { id: 'fb3', label: '50 Mbps · 30 days',  price: 350.00 },
  { id: 'fb4', label: '100 Mbps · 30 days', price: 500.00, tag: 'Premium' },
];
