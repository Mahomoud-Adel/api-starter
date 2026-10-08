import { Router } from 'express';
import { validate } from '../../core/http/validate';
import { usersController as c } from './users.controller';
import { createUserSchema, idParamSchema } from './users.validation';

const router = Router();

router.get('/', c.getAll);
router.get('/:id', validate(idParamSchema), c.getOne);
router.post('/', validate(createUserSchema), c.create);
router.delete('/:id', validate(idParamSchema), c.remove);

export default router;