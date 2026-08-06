import { formatGHS } from '../format';

describe('formatGHS', () => {
  it('formats whole number', () => {
    expect(formatGHS(100)).toBe('GHS 100.00');
  });
  it('formats decimal amount', () => {
    expect(formatGHS(1234.5)).toBe('GHS 1,234.50');
  });
  it('formats zero', () => {
    expect(formatGHS(0)).toBe('GHS 0.00');
  });
  it('rounds to 2 decimal places', () => {
    expect(formatGHS(9.999)).toBe('GHS 10.00');
  });
  it('formats thousands', () => {
    expect(formatGHS(12345.67)).toBe('GHS 12,345.67');
  });
  it('handles NaN', () => {
    expect(formatGHS(NaN)).toBe('GHS 0.00');
  });
});
