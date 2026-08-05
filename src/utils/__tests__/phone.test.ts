import { ghanaPhoneSchema } from '../phone';

describe('ghanaPhoneSchema', () => {
  const valid = ['0241234567', '0201234567', '0551234567', '0301234567'];
  const invalid = [
    '024123456',    // 9 digits
    '02412345678',  // 11 digits
    '1241234567',   // doesn't start with 0
    '0441234567',   // invalid operator prefix
    '',
  ];

  test.each(valid)('accepts valid number %s', (phone) => {
    expect(ghanaPhoneSchema.safeParse(phone).success).toBe(true);
  });

  test.each(invalid)('rejects invalid number %s', (phone) => {
    expect(ghanaPhoneSchema.safeParse(phone).success).toBe(false);
  });
});
