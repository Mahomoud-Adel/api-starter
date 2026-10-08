import jwt from 'jsonwebtoken';
import { setAuthProvider } from '../core/auth/auth';
import { env } from '../core/config/env';

setAuthProvider((req) => {
  
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;       


  try {
    return jwt.verify(token, env.JWT_SECRET) as any;   // { id: 5, roles: ['vendor'] }
  } catch {
    return null;                                  
  }
});