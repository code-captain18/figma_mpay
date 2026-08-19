import { normalizeGhanaPhone } from '../../utils/phone';

describe('normalizeGhanaPhone', () => {
    test.each([
        ['0241234567', '0241234567'],
        ['0201234567', '0201234567'],
        ['0551234567', '0551234567'],
        ['+233241234567', '0241234567'],
        ['233241234567', '0241234567'],
        ['024 123 4567', '0241234567'],
        ['024-123-4567', '0241234567'],
    ])('normalizes %s → %s', (input, expected) => {
        expect(normalizeGhanaPhone(input)).toBe(expected);
    });

    test.each([
        [''],
        ['12345'],
        ['0441234567'],   // invalid prefix
        ['+1 650 555 0100'], // US number
        ['1234567890'],   // 10 digits but no leading 0
    ])('returns null for %s', (input) => {
        expect(normalizeGhanaPhone(input)).toBeNull();
    });
});
