import { Router } from 'express';
import { register, login, getCurrentUser, updateProfile } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema, updateProfileSchema } from './auth.schema.js';
import { requireAuth } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', requireAuth, getCurrentUser);
router.put('/profile', requireAuth, validate(updateProfileSchema), updateProfile);

export default router;
