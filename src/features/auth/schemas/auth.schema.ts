import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(4, "Password must be at least 4 characters"),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name is required"),
  phone: z
    .string()
    .min(9, "Enter a valid phone number")
    .regex(/^\d+$/, "Phone must contain only digits"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  pin: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d+$/, "PIN must contain only digits"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
