import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireSubscription } from '../middleware/subscription';
import {
  generateAIRecommendationsController,
  generateCertificateController,
  getCertificateController,
  calculateTaxIncentivesController,
  getTaxIncentiveController,
  getAvailableOffsetsController,
  purchaseOffsetController,
  getEventOffsetPurchasesController,
  getOrganizationOffsetPurchasesController,
  getSuppliersByCategoryController,
  searchSuppliersController,
  addSupplierToEventController,
  getEventSuppliersController,
  compareWithBenchmarksController
} from '../controllers/planner.controller';

const router = Router();

// All routes require authentication and Planner subscription
router.use(authenticate);
router.use(requireSubscription('planner'));

// AI Recommendations
router.post('/ai-recommendations', generateAIRecommendationsController);

// Green Score Card Certificates
router.post('/certificate', generateCertificateController);
router.get('/certificate/:eventId', getCertificateController);

// Tax Incentives (South Africa)
router.post('/tax-incentives', calculateTaxIncentivesController);
router.get('/tax-incentives/:eventId', getTaxIncentiveController);

// Carbon Offset Marketplace
router.get('/carbon-offsets', getAvailableOffsetsController);
router.post('/carbon-offsets/purchase', purchaseOffsetController);
router.get('/carbon-offsets/event/:eventId', getEventOffsetPurchasesController);
router.get('/carbon-offsets/organization', getOrganizationOffsetPurchasesController);

// Supplier Carbon Tracking
router.get('/suppliers/search', searchSuppliersController);
router.get('/suppliers/:category', getSuppliersByCategoryController);
router.post('/suppliers/event', addSupplierToEventController);
router.get('/suppliers/event/:eventId', getEventSuppliersController);

// Benchmark Comparison
router.post('/benchmarks/compare', compareWithBenchmarksController);

export default router;

