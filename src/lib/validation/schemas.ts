import { z } from "zod";

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
export const uuidSchema = z.string().regex(uuidRegex, {
  message: "Invalid UUID format",
});

export const optionalTeamIdSchema = z
  .string()
  .optional()
  .refine((val) => !val || uuidRegex.test(val), {
    message: "Invalid UUID format",
  });

export const usernameSchema = z
  .string()
  .min(3, { message: "Must be at least 3 characters long." });

export const emailSchema = z
  .string()
  .email({ message: "Invalid email address." });

export const passwordSchema = z
  .string()
  .min(6, { message: "Must be at least 6 characters long." });

export const todoTitleSchema = z
  .string()
  .min(6, { message: "Must be at least 6 characters long." });

export const teamNameSchema = z
  .string()
  .min(6, { message: "Must be at least 6 characters long." });
