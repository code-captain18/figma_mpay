import { z } from 'zod';

/** Accepts 10-digit Ghana mobile numbers starting with a valid operator prefix (0[235]XXXXXXXX). */
export const ghanaPhoneSchema = z
    .string()
    .length(10, 'Phone number must be 10 digits')
    .regex(/^0[235]\d{8}$/, 'Enter a valid Ghana number (e.g. 0241234567)');

/**
 * Normalizes a raw phone number string to a 10-digit Ghana local format (e.g. 0241234567).
 * Handles:  +233XXXXXXXXX  /  233XXXXXXXXX  /  0XXXXXXXXX  /  spaces/dashes.
 * Returns null if the result is not a valid Ghana mobile number.
 */
export function normalizeGhanaPhone(raw: string): string | null {
    const digits = raw.replace(/\D/g, '');

    let local: string;
    if (digits.startsWith('233') && digits.length === 12) {
        local = '0' + digits.slice(3);
    } else if (digits.startsWith('0') && digits.length === 10) {
        local = digits;
    } else {
        return null;
    }

    return ghanaPhoneSchema.safeParse(local).success ? local : null;
}
