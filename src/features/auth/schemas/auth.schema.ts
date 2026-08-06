import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username or account ID is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
