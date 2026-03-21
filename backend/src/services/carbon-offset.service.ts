import { query } from '../config/database';
import { logger } from '../utils/logger';

interface CarbonOffset {
  id: number;
  projectName: string;
  projectType: string;
  location: string;
  certification: string;
  pricePerTonZar: number;
  availableTons: number;
  description: string;
  imageUrl?: string;
}

interface OffsetPurchase {
  eventId: number;
  organizationId: number;
  offsetId: number;
  tonsPurchased: number;
  totalCostZar: number;
}

/**
 * Get all available carbon offset projects
 */
export async function getAvailableOffsets(filters?: {
  projectType?: string;
  maxPrice?: number;
  certification?: string;
}): Promise<CarbonOffset[]> {
  try {
    let sql = 'SELECT * FROM carbon_offsets WHERE is_active = true AND available_tons > 0';
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.projectType) {
      paramCount++;
      sql += ` AND project_type = $${paramCount}`;
      params.push(filters.projectType);
    }

    if (filters?.maxPrice) {
      paramCount++;
      sql += ` AND price_per_ton_zar <= $${paramCount}`;
      params.push(filters.maxPrice);
    }

    if (filters?.certification) {
      paramCount++;
      sql += ` AND certification = $${paramCount}`;
      params.push(filters.certification);
    }

    sql += ' ORDER BY price_per_ton_zar ASC';

    const offsets = await query<CarbonOffset>(sql, params);
    return offsets;

  } catch (error) {
    logger.error('Failed to fetch carbon offsets:', error);
    throw new Error('Failed to fetch carbon offsets');
  }
}

/**
 * Purchase carbon offset credits
 */
export async function purchaseOffset(purchase: OffsetPurchase): Promise<number> {
  try {
    // Check if offset is available
    const offsetResult = await query<CarbonOffset>(
      'SELECT * FROM carbon_offsets WHERE id = $1 AND is_active = true',
      [purchase.offsetId]
    );

    if (offsetResult.length === 0) {
      throw new Error('Carbon offset project not found or inactive');
    }

    const offset = offsetResult[0];

    if (offset.availableTons < purchase.tonsPurchased) {
      throw new Error(`Insufficient carbon credits available. Only ${offset.availableTons} tons remaining.`);
    }

    // Calculate total cost
    const totalCost = purchase.tonsPurchased * offset.pricePerTonZar;

    // Create purchase record
    const purchaseResult = await query(
      `INSERT INTO offset_purchases (
        event_id, organization_id, offset_id, tons_purchased, total_cost_zar, status
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        purchase.eventId,
        purchase.organizationId,
        purchase.offsetId,
        purchase.tonsPurchased,
        totalCost,
        'completed'
      ]
    );

    const purchaseId = purchaseResult[0].id;

    // Update available tons
    await query(
      'UPDATE carbon_offsets SET available_tons = available_tons - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [purchase.tonsPurchased, purchase.offsetId]
    );

    logger.info(`Carbon offset purchased: ${purchase.tonsPurchased} tons for event ${purchase.eventId}`);
    return purchaseId;

  } catch (error) {
    logger.error('Failed to purchase carbon offset:', error);
    throw error;
  }
}

/**
 * Get offset purchases for an event
 */
export async function getEventOffsetPurchases(eventId: number): Promise<any[]> {
  try {
    const purchases = await query(
      `SELECT 
        op.*,
        co.project_name,
        co.project_type,
        co.location,
        co.certification
      FROM offset_purchases op
      JOIN carbon_offsets co ON op.offset_id = co.id
      WHERE op.event_id = $1
      ORDER BY op.created_at DESC`,
      [eventId]
    );

    return purchases;

  } catch (error) {
    logger.error('Failed to fetch offset purchases:', error);
    throw new Error('Failed to fetch offset purchases');
  }
}

/**
 * Get offset purchases for an organization
 */
export async function getOrganizationOffsetPurchases(organizationId: number): Promise<any[]> {
  try {
    const purchases = await query(
      `SELECT 
        op.*,
        co.project_name,
        co.project_type,
        co.location,
        co.certification,
        e.name as event_name
      FROM offset_purchases op
      JOIN carbon_offsets co ON op.offset_id = co.id
      JOIN events e ON op.event_id = e.id
      WHERE op.organization_id = $1
      ORDER BY op.created_at DESC`,
      [organizationId]
    );

    return purchases;

  } catch (error) {
    logger.error('Failed to fetch organization offset purchases:', error);
    throw new Error('Failed to fetch organization offset purchases');
  }
}

/**
 * Seed initial carbon offset projects
 */
export async function seedCarbonOffsets(): Promise<void> {
  const offsets = [
    {
      projectName: 'Kruger National Park Reforestation',
      projectType: 'reforestation',
      location: 'Mpumalanga, South Africa',
      certification: 'Gold Standard',
      pricePerTonZar: 180,
      availableTons: 10000,
      description: 'Indigenous tree planting project in the Greater Kruger area, supporting biodiversity and local communities.'
    },
    {
      projectName: 'Cape Town Wind Farm',
      projectType: 'renewable_energy',
      location: 'Western Cape, South Africa',
      certification: 'VCS',
      pricePerTonZar: 220,
      availableTons: 5000,
      description: 'Offshore wind energy project reducing reliance on coal-powered electricity.'
    },
    {
      projectName: 'Durban Mangrove Restoration',
      projectType: 'blue_carbon',
      location: 'KwaZulu-Natal, South Africa',
      certification: 'Gold Standard',
      pricePerTonZar: 250,
      availableTons: 3000,
      description: 'Coastal mangrove restoration project protecting marine ecosystems and sequestering carbon.'
    }
  ];

  for (const offset of offsets) {
    await query(
      `INSERT INTO carbon_offsets (
        project_name, project_type, location, certification, price_per_ton_zar, available_tons, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING`,
      [
        offset.projectName,
        offset.projectType,
        offset.location,
        offset.certification,
        offset.pricePerTonZar,
        offset.availableTons,
        offset.description
      ]
    );
  }

  logger.info('Carbon offset projects seeded');
}

