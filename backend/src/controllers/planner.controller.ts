import { Request, Response } from 'express';
import { generateAIRecommendations } from '../services/ai-recommendations.service';
import { generateCertificate, getCertificateByEventId } from '../services/certificate.service';
import { calculateTaxIncentives, getTaxIncentiveByEventId } from '../services/tax-incentive.service';
import {
  getAvailableOffsets,
  purchaseOffset,
  getEventOffsetPurchases,
  getOrganizationOffsetPurchases
} from '../services/carbon-offset.service';
import {
  getSuppliersByCategory,
  searchSuppliers,
  addSupplierToEvent,
  getEventSuppliers
} from '../services/supplier.service';
import { compareWithBenchmarks } from '../services/benchmark.service';
import { logger } from '../utils/logger';

/**
 * Generate AI-powered recommendations
 * POST /api/planner/ai-recommendations
 */
export async function generateAIRecommendationsController(req: Request, res: Response): Promise<void> {
  try {
    const { eventId, inputs, carbonFootprint } = req.body;
    const organizationId = req.organizationId;

    if (!organizationId) {
      res.status(401).json({ success: false, error: 'Organization ID required' });
      return;
    }

    const recommendations = await generateAIRecommendations(
      eventId,
      parseInt(organizationId),
      inputs,
      carbonFootprint
    );

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    logger.error('AI recommendations error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate AI recommendations' });
  }
}

/**
 * Generate Green Score Card Certificate
 * POST /api/planner/certificate
 */
export async function generateCertificateController(req: Request, res: Response): Promise<void> {
  try {
    const certificateData = req.body;
    const organizationId = req.organizationId;

    if (!organizationId) {
      res.status(401).json({ success: false, error: 'Organization ID required' });
      return;
    }

    certificateData.organizationId = parseInt(organizationId);
    const certificateNumber = await generateCertificate(certificateData);

    res.json({
      success: true,
      data: { certificateNumber }
    });

  } catch (error) {
    logger.error('Certificate generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate certificate' });
  }
}

/**
 * Get certificate by event ID
 * GET /api/planner/certificate/:eventId
 */
export async function getCertificateController(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const certificate = await getCertificateByEventId(parseInt(eventId));

    res.json({
      success: true,
      data: { certificate }
    });

  } catch (error) {
    logger.error('Get certificate error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch certificate' });
  }
}

/**
 * Calculate tax incentives
 * POST /api/planner/tax-incentives
 */
export async function calculateTaxIncentivesController(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body;
    const organizationId = req.organizationId;

    if (!organizationId) {
      res.status(401).json({ success: false, error: 'Organization ID required' });
      return;
    }

    input.organizationId = parseInt(organizationId);
    const result = await calculateTaxIncentives(input);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Tax incentive calculation error:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate tax incentives' });
  }
}

/**
 * Get tax incentive by event ID
 * GET /api/planner/tax-incentives/:eventId
 */
export async function getTaxIncentiveController(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const taxIncentive = await getTaxIncentiveByEventId(parseInt(eventId));

    res.json({
      success: true,
      data: { taxIncentive }
    });

  } catch (error) {
    logger.error('Get tax incentive error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tax incentive' });
  }
}

/**
 * Get available carbon offsets
 * GET /api/planner/carbon-offsets
 */
export async function getAvailableOffsetsController(req: Request, res: Response): Promise<void> {
  try {
    const { projectType, maxPrice, certification } = req.query;
    
    const filters = {
      projectType: projectType as string,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      certification: certification as string
    };

    const offsets = await getAvailableOffsets(filters);

    res.json({
      success: true,
      data: { offsets }
    });

  } catch (error) {
    logger.error('Get carbon offsets error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch carbon offsets' });
  }
}

/**
 * Purchase carbon offset
 * POST /api/planner/carbon-offsets/purchase
 */
export async function purchaseOffsetController(req: Request, res: Response): Promise<void> {
  try {
    const purchase = req.body;
    const organizationId = req.organizationId;

    if (!organizationId) {
      res.status(401).json({ success: false, error: 'Organization ID required' });
      return;
    }

    purchase.organizationId = parseInt(organizationId);
    const purchaseId = await purchaseOffset(purchase);

    res.json({
      success: true,
      data: { purchaseId }
    });

  } catch (error: any) {
    logger.error('Purchase offset error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to purchase offset' });
  }
}

/**
 * Get offset purchases for event
 * GET /api/planner/carbon-offsets/event/:eventId
 */
export async function getEventOffsetPurchasesController(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const purchases = await getEventOffsetPurchases(parseInt(eventId));

    res.json({
      success: true,
      data: { purchases }
    });

  } catch (error) {
    logger.error('Get event offset purchases error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch offset purchases' });
  }
}

/**
 * Get offset purchases for organization
 * GET /api/planner/carbon-offsets/organization
 */
export async function getOrganizationOffsetPurchasesController(req: Request, res: Response): Promise<void> {
  try {
    const organizationId = req.organizationId;

    if (!organizationId) {
      res.status(401).json({ success: false, error: 'Organization ID required' });
      return;
    }

    const purchases = await getOrganizationOffsetPurchases(parseInt(organizationId));

    res.json({
      success: true,
      data: { purchases }
    });

  } catch (error) {
    logger.error('Get organization offset purchases error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch offset purchases' });
  }
}

/**
 * Get suppliers by category
 * GET /api/planner/suppliers/:category
 */
export async function getSuppliersByCategoryController(req: Request, res: Response): Promise<void> {
  try {
    const { category } = req.params;
    const { minCarbonScore } = req.query;

    const suppliers = await getSuppliersByCategory(
      category,
      minCarbonScore ? parseInt(minCarbonScore as string) : undefined
    );

    res.json({
      success: true,
      data: { suppliers }
    });

  } catch (error) {
    logger.error('Get suppliers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch suppliers' });
  }
}

/**
 * Search suppliers
 * GET /api/planner/suppliers/search
 */
export async function searchSuppliersController(req: Request, res: Response): Promise<void> {
  try {
    const { q, category } = req.query;

    if (!q) {
      res.status(400).json({ success: false, error: 'Search query required' });
      return;
    }

    const suppliers = await searchSuppliers(q as string, category as string);

    res.json({
      success: true,
      data: { suppliers }
    });

  } catch (error) {
    logger.error('Search suppliers error:', error);
    res.status(500).json({ success: false, error: 'Failed to search suppliers' });
  }
}

/**
 * Add supplier to event
 * POST /api/planner/suppliers/event
 */
export async function addSupplierToEventController(req: Request, res: Response): Promise<void> {
  try {
    const { eventId, supplierId, category, costZar, carbonImpactKg } = req.body;

    await addSupplierToEvent(eventId, supplierId, category, costZar, carbonImpactKg);

    res.json({
      success: true,
      message: 'Supplier added to event'
    });

  } catch (error) {
    logger.error('Add supplier to event error:', error);
    res.status(500).json({ success: false, error: 'Failed to add supplier to event' });
  }
}

/**
 * Get suppliers for event
 * GET /api/planner/suppliers/event/:eventId
 */
export async function getEventSuppliersController(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const suppliers = await getEventSuppliers(parseInt(eventId));

    res.json({
      success: true,
      data: { suppliers }
    });

  } catch (error) {
    logger.error('Get event suppliers error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch event suppliers' });
  }
}

/**
 * Compare with industry benchmarks
 * POST /api/planner/benchmarks/compare
 */
export async function compareWithBenchmarksController(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    const comparison = await compareWithBenchmarks(data);

    res.json({
      success: true,
      data: comparison
    });

  } catch (error) {
    logger.error('Benchmark comparison error:', error);
    res.status(500).json({ success: false, error: 'Failed to compare with benchmarks' });
  }
}

