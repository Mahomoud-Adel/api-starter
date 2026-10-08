import 'dotenv/config';
import { z } from 'zod';

export const env = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(1),
  })
  .parse(process.env);
