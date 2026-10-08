import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validate =
  (schema: z.ZodType<{ body?: any; params?: any; query?: any }>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.parse({ body: req.body, params: req.params, query: req.query });
    if (parsed.body) req.body = parsed.body;
    if (parsed.params) Object.defineProperty(req, 'params', { value: parsed.params, writable: true });
    if (parsed.query) Object.defineProperty(req, 'query', { value: parsed.query, writable: true });
    next();
  };