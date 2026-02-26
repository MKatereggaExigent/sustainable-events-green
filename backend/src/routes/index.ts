import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import costRoutes from './cost.routes';
import incentiveRoutes from './incentive.routes';
import organizationRoutes from './organization.routes';
import tourRoutes from './tour.routes';
import settingsRoutes from './settings.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/costs', costRoutes);
router.use('/incentives', incentiveRoutes);
router.use('/organizations', organizationRoutes);
router.use('/tour', tourRoutes);
router.use('/settings', settingsRoutes);

export default router;

