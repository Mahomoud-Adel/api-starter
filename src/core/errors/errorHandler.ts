import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from './ApiError';
import { env } from '../config/env';

export const notFound = (req: Request, _res: Response, next: NextFunction) =>
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let status = 500;
  let message = 'Internal server error';
  let errors: unknown;

  if (err instanceof ApiError) {
    ({ status, message, errors } = err);
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    errors = err.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
  } else if (err?.code === '23505') {
    status = 409;
    message = 'Resource already exists';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON';
  }

  if (status === 500) console.error(err);

  res.status(status).json({
    success: false,
    message,
    errors,
    ...(env.NODE_ENV === 'development' && status === 500 && { stack: err.stack }),
  });
};