import { genRef } from '../ref';

describe('genRef', () => {
  it('starts with REF-', () => {
    expect(genRef()).toMatch(/^REF-/);
  });
  it('matches expected format', () => {
    expect(genRef()).toMatch(/^REF-\d{8}-\d{6}-[A-F0-9]{6}$/);
  });
  it('generates unique refs', () => {
    const refs = new Set(Array.from({ length: 50 }, genRef));
    expect(refs.size).toBe(50);
  });
});
