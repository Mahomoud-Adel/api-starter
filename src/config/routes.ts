import { Router } from 'express';
import usersRoutes from '../modules/users/users.routes';

const router = Router();
router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'up' } }));
router.use('/users', usersRoutes);

export default router;