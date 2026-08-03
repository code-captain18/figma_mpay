import { z } from 'zod';

/** Accepts 10-digit Ghana mobile numbers starting with a valid operator prefix (0[235]XXXXXXXX). */
export const ghanaPhoneSchema = z
    .string()
    .length(10, 'Phone number must be 10 digits')
    .regex(/^0[235]\d{8}$/, 'Enter a valid Ghana number (e.g. 0241234567)');
