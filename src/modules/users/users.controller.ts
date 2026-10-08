import { Request, Response } from 'express';
import { ok, created, noContent } from '../../core/http/ApiResponse';
import { usersService } from './users.service';

export const usersController = {
  getAll: async (_req: Request, res: Response) =>
    ok(res, await usersService.findAll()),

  getOne: async (req: Request, res: Response) =>
    ok(res, await usersService.findById(Number(req.params.id))),

  create: async (req: Request, res: Response) =>
    created(res, await usersService.create(req.body)),

  remove: async (req: Request, res: Response) => {
    await usersService.remove(Number(req.params.id));
    noContent(res);
  },
};