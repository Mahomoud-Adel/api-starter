import { Policy } from './types';

export const hasRole = (...roles: string[]): Policy => (u) => {
  const userRoles = ([] as string[]).concat((u.roles ?? u.role ?? []) as string | string[]);
  return roles.some((r) => userRoles.includes(r));
};

export const hasPermission = (perm: string): Policy => (u) =>
  ((u.permissions as string[]) ?? []).includes(perm);

export const isOwner = (param = 'id'): Policy => (u, req) =>
  String(u.id) === req.params[param];

export const anyOf = (...ps: Policy[]): Policy => async (u, req) => {
  for (const p of ps) if (await p(u, req)) return true;
  return false;
};