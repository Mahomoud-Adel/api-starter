import { Response } from 'express';

export const ok = <T>(res: Response, data: T, message = 'Success', meta?: object) =>
  res.status(200).json({ success: true, message, data, meta });

export const created = <T>(res: Response, data: T, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

export const noContent = (res: Response) => res.status(204).send();