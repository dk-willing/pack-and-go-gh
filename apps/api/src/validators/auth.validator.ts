import { z } from "zod";

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(128, "Password must not exceed 128 characters");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  email: z.string().trim().email("Enter a valid email address").max(254).transform((value) => value.toLowerCase()),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Password is required").max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required").max(128),
  newPassword: passwordSchema,
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});