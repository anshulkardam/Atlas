import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string("Name is Required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type registerPayload = z.infer<typeof registerSchema>;
