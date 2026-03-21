import { query } from '../config/database';
import { logger } from '../utils/logger';

interface Supplier {
  id?: number;
  name: string;
  category: string;
  location: string;
  carbonScore: number;
  sustainabilityRating: string;
  certifications: string[];
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  description?: string;
  isVerified: boolean;
}

/**
 * Get suppliers by category with carbon scores
 */
export async function getSuppliersByCategory(category: string, minCarbonScore?: number): Promise<Supplier[]> {
  try {
    let sql = 'SELECT * FROM suppliers WHERE category = $1';
    const params: any[] = [category];

    if (minCarbonScore) {
      sql += ' AND carbon_score >= $2';
      params.push(minCarbonScore);
    }

    sql += ' ORDER BY carbon_score DESC, sustainability_rating ASC';

    const suppliers = await query<Supplier>(sql, params);
    return suppliers;

  } catch (error) {
    logger.error('Failed to fetch suppliers:', error);
    throw new Error('Failed to fetch suppliers');
  }
}

/**
 * Search suppliers
 */
export async function searchSuppliers(searchTerm: string, category?: string): Promise<Supplier[]> {
  try {
    let sql = `SELECT * FROM suppliers 
               WHERE (name ILIKE $1 OR description ILIKE $1)`;
    const params: any[] = [`%${searchTerm}%`];

    if (category) {
      sql += ' AND category = $2';
      params.push(category);
    }

    sql += ' ORDER BY carbon_score DESC LIMIT 50';

    const suppliers = await query<Supplier>(sql, params);
    return suppliers;

  } catch (error) {
    logger.error('Failed to search suppliers:', error);
    throw new Error('Failed to search suppliers');
  }
}

/**
 * Add supplier to event
 */
export async function addSupplierToEvent(
  eventId: number,
  supplierId: number,
  category: string,
  costZar?: number,
  carbonImpactKg?: number
): Promise<void> {
  try {
    await query(
      `INSERT INTO event_suppliers (event_id, supplier_id, category, cost_zar, carbon_impact_kg)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (event_id, supplier_id, category) DO UPDATE
       SET cost_zar = $4, carbon_impact_kg = $5`,
      [eventId, supplierId, category, costZar, carbonImpactKg]
    );

    logger.info(`Supplier ${supplierId} added to event ${eventId}`);

  } catch (error) {
    logger.error('Failed to add supplier to event:', error);
    throw new Error('Failed to add supplier to event');
  }
}

/**
 * Get suppliers for an event
 */
export async function getEventSuppliers(eventId: number): Promise<any[]> {
  try {
    const suppliers = await query(
      `SELECT 
        es.*,
        s.name,
        s.carbon_score,
        s.sustainability_rating,
        s.certifications,
        s.location
      FROM event_suppliers es
      JOIN suppliers s ON es.supplier_id = s.id
      WHERE es.event_id = $1
      ORDER BY s.carbon_score DESC`,
      [eventId]
    );

    return suppliers;

  } catch (error) {
    logger.error('Failed to fetch event suppliers:', error);
    throw new Error('Failed to fetch event suppliers');
  }
}

/**
 * Seed initial suppliers
 */
export async function seedSuppliers(): Promise<void> {
  const suppliers: Supplier[] = [
    // Venues
    {
      name: 'The Green Venue',
      category: 'venue',
      location: 'Cape Town, Western Cape',
      carbonScore: 92,
      sustainabilityRating: 'A+',
      certifications: ['ISO 14001', 'Green Building Council SA'],
      contactEmail: 'info@greenvenue.co.za',
      websiteUrl: 'https://greenvenue.co.za',
      description: '100% solar-powered event venue with rainwater harvesting',
      isVerified: true
    },
    {
      name: 'Eco Conference Center',
      category: 'venue',
      location: 'Johannesburg, Gauteng',
      carbonScore: 88,
      sustainabilityRating: 'A',
      certifications: ['ISO 14001', 'LEED Gold'],
      contactEmail: 'bookings@ecoconf.co.za',
      description: 'Energy-efficient venue with waste-to-energy systems',
      isVerified: true
    },
    // Catering
    {
      name: 'Plant-Based Catering Co',
      category: 'catering',
      location: 'Durban, KwaZulu-Natal',
      carbonScore: 95,
      sustainabilityRating: 'A+',
      certifications: ['Organic SA', 'Fair Trade'],
      contactEmail: 'hello@plantbasedcatering.co.za',
      description: '100% plant-based menus using local organic ingredients',
      isVerified: true
    },
    {
      name: 'Sustainable Events Catering',
      category: 'catering',
      location: 'Pretoria, Gauteng',
      carbonScore: 85,
      sustainabilityRating: 'A',
      certifications: ['ISO 22000'],
      contactEmail: 'info@sustainablecatering.co.za',
      description: 'Zero-waste catering with compostable packaging',
      isVerified: true
    },
    // Transport
    {
      name: 'Green Fleet Shuttles',
      category: 'transport',
      location: 'Cape Town, Western Cape',
      carbonScore: 90,
      sustainabilityRating: 'A+',
      certifications: ['Carbon Neutral Certified'],
      contactEmail: 'bookings@greenfleet.co.za',
      description: 'Electric and hybrid vehicle fleet for event transport',
      isVerified: true
    }
  ];

  for (const supplier of suppliers) {
    await query(
      `INSERT INTO suppliers (
        name, category, location, carbon_score, sustainability_rating, certifications,
        contact_email, website_url, description, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT DO NOTHING`,
      [
        supplier.name,
        supplier.category,
        supplier.location,
        supplier.carbonScore,
        supplier.sustainabilityRating,
        supplier.certifications,
        supplier.contactEmail,
        supplier.websiteUrl,
        supplier.description,
        supplier.isVerified
      ]
    );
  }

  logger.info('Suppliers seeded');
}

