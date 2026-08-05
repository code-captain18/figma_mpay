import { formatGHS } from '../format';

describe('formatGHS', () => {
  it('formats whole number', () => {
    expect(formatGHS(100)).toBe('GH₵100.00');
  });
  it('formats decimal amount', () => {
    expect(formatGHS(1234.5)).toBe('GH₵1234.50');
  });
  it('formats zero', () => {
    expect(formatGHS(0)).toBe('GH₵0.00');
  });
  it('rounds to 2 decimal places', () => {
    expect(formatGHS(9.999)).toBe('GH₵10.00');
  });
});
