import { Request } from 'express';

export interface AuthUser {
  id: number | string;
  [key: string]: unknown;
}

export type AuthProvider = (req: Request) => Promise<AuthUser | null> | AuthUser | null;

export type Policy = (user: AuthUser, req: Request) => boolean | Promise<boolean>;

declare global {
  namespace Express {
    interface Request { user?: AuthUser }
  }
}