import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const linkSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL.'),
  title: z.string().optional(),
  description: z.string().optional(),
  shortId: z.string()
    .min(3, 'Must be at least 3 characters.')
    .max(32, 'Must be at most 32 characters.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores allowed.')
    .optional()
    .or(z.literal('')),
});
