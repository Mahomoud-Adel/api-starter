import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.coerce.number().int().positive() }),
});