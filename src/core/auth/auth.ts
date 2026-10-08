import { RequestHandler } from 'express';
import { ApiError } from '../errors/ApiError';
import { AuthProvider, Policy } from './types';

let provider: AuthProvider = () => null;

export const setAuthProvider = (p: AuthProvider) => { provider = p; };


export const attachUser: RequestHandler = async (req, _res, next) => {
  req.user = (await provider(req)) ?? undefined;
  next();
};

export const authenticate: RequestHandler = (req, _res, next) => {
  if (!req.user) throw ApiError.unauthorized();
  next();
};

export const authorize =
  (...policies: Policy[]): RequestHandler =>
  async (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    for (const p of policies) {
      if (!(await p(req.user, req))) throw ApiError.forbidden();
    }
    next();
  };