import { query, transaction } from '../config/database';
import { invalidateCachePattern, getCache, setCache } from '../config/redis';
import { logger } from '../utils/logger';

export interface EventInput {
  name: string;
  description?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  attendeeCount?: number;
  status?: string;
  isPublic?: boolean;
}

export interface CarbonDataInput {
  venue: { type: string; size: string; duration: number; energySource: string };
  fnb: { guests: number; mealType: string; beverages: string; catering: string };
  transport: { attendees: number; avgDistance: number; transportMode: string; shuttleService: boolean };
  materials: { printedMaterials: string; decorations: string; swagBags: boolean; digitalAlternatives: boolean };
  results: { carbonKg: number; waterLiters: number; wasteKg: number; greenScore: number; breakdown: any };
}

export interface CostDataInput {
  venueCost: number;
  energyCost: number;
  cateringCost: number;
  transportCost: number;
  materialsCost: number;
  wasteDisposalCost: number;
  region: string;
  results?: any;
}

export async function getEvents(organizationId: string, filters?: any) {
  const cacheKey = `events:${organizationId}:${JSON.stringify(filters || {})}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  let sql = `SELECT e.*, ecd.green_score, ec.total_savings
             FROM events e
             LEFT JOIN event_carbon_data ecd ON e.id = ecd.event_id
             LEFT JOIN event_costs ec ON e.id = ec.event_id
             WHERE e.organization_id = $1`;
  const params: any[] = [organizationId];
  let paramIndex = 2;

  if (filters?.status) {
    sql += ` AND e.status = $${paramIndex++}`;
    params.push(filters.status);
  }

  sql += ' ORDER BY e.created_at DESC';

  if (filters?.limit) {
    sql += ` LIMIT $${paramIndex++}`;
    params.push(filters.limit);
  }

  const events = await query(sql, params);
  await setCache(cacheKey, events, 300);
  return events;
}

export async function getEventById(eventId: string, organizationId: string) {
  const events = await query(
    `SELECT e.*, 
            ecd.venue_type, ecd.venue_size, ecd.venue_duration, ecd.venue_energy_source,
            ecd.fnb_guests, ecd.fnb_meal_type, ecd.fnb_beverages, ecd.fnb_catering,
            ecd.transport_attendees, ecd.transport_avg_distance, ecd.transport_mode, ecd.transport_shuttle_service,
            ecd.materials_printed, ecd.materials_decorations, ecd.materials_swag_bags, ecd.materials_digital_alternatives,
            ecd.carbon_kg, ecd.water_liters, ecd.waste_kg, ecd.green_score,
            ecd.breakdown_venue, ecd.breakdown_fnb, ecd.breakdown_transport, ecd.breakdown_materials,
            ec.venue_cost, ec.energy_cost, ec.catering_cost, ec.transport_cost, ec.materials_cost,
            ec.waste_disposal_cost, ec.region, ec.traditional_total, ec.sustainable_total, ec.total_savings
     FROM events e
     LEFT JOIN event_carbon_data ecd ON e.id = ecd.event_id
     LEFT JOIN event_costs ec ON e.id = ec.event_id
     WHERE e.id = $1 AND e.organization_id = $2`,
    [eventId, organizationId]
  );
  return events[0] || null;
}

export async function createEvent(organizationId: string, userId: string, input: EventInput) {
  return transaction(async (client) => {
    const result = await client.query(
      `INSERT INTO events (organization_id, created_by, name, description, event_type, start_date, end_date, location, attendee_count, status, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [organizationId, userId, input.name, input.description, input.eventType, input.startDate, input.endDate, input.location, input.attendeeCount || 0, input.status || 'draft', input.isPublic || false]
    );

    await invalidateCachePattern(`events:${organizationId}:*`);
    return result.rows[0];
  });
}

export async function updateEvent(eventId: string, organizationId: string, input: Partial<EventInput>) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  const allowedFields = ['name', 'description', 'event_type', 'start_date', 'end_date', 'location', 'attendee_count', 'status', 'is_public'];
  const inputMap: Record<string, string> = { eventType: 'event_type', startDate: 'start_date', endDate: 'end_date', attendeeCount: 'attendee_count', isPublic: 'is_public' };

  for (const [key, value] of Object.entries(input)) {
    const dbField = inputMap[key] || key;
    if (allowedFields.includes(dbField) && value !== undefined) {
      fields.push(`${dbField} = $${paramIndex++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(eventId, organizationId);

  const result = await query(
    `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND organization_id = $${paramIndex} RETURNING *`,
    values
  );

  await invalidateCachePattern(`events:${organizationId}:*`);
  return result[0] || null;
}

export async function deleteEvent(eventId: string, organizationId: string) {
  const result = await query(
    'DELETE FROM events WHERE id = $1 AND organization_id = $2 RETURNING id',
    [eventId, organizationId]
  );
  await invalidateCachePattern(`events:${organizationId}:*`);
  return result.length > 0;
}

export async function saveCarbonData(eventId: string, data: CarbonDataInput) {
  const r = data.results;
  const b = r.breakdown;
  await query(
    `INSERT INTO event_carbon_data (event_id, venue_type, venue_size, venue_duration, venue_energy_source,
      fnb_guests, fnb_meal_type, fnb_beverages, fnb_catering, transport_attendees, transport_avg_distance,
      transport_mode, transport_shuttle_service, materials_printed, materials_decorations, materials_swag_bags,
      materials_digital_alternatives, carbon_kg, water_liters, waste_kg, green_score,
      breakdown_venue, breakdown_fnb, breakdown_transport, breakdown_materials)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
     ON CONFLICT (event_id) DO UPDATE SET
       venue_type=$2, venue_size=$3, venue_duration=$4, venue_energy_source=$5, fnb_guests=$6, fnb_meal_type=$7,
       fnb_beverages=$8, fnb_catering=$9, transport_attendees=$10, transport_avg_distance=$11, transport_mode=$12,
       transport_shuttle_service=$13, materials_printed=$14, materials_decorations=$15, materials_swag_bags=$16,
       materials_digital_alternatives=$17, carbon_kg=$18, water_liters=$19, waste_kg=$20, green_score=$21,
       breakdown_venue=$22, breakdown_fnb=$23, breakdown_transport=$24, breakdown_materials=$25, updated_at=CURRENT_TIMESTAMP`,
    [eventId, data.venue.type, data.venue.size, data.venue.duration, data.venue.energySource,
     data.fnb.guests, data.fnb.mealType, data.fnb.beverages, data.fnb.catering,
     data.transport.attendees, data.transport.avgDistance, data.transport.transportMode, data.transport.shuttleService,
     data.materials.printedMaterials, data.materials.decorations, data.materials.swagBags, data.materials.digitalAlternatives,
     r.carbonKg, r.waterLiters, r.wasteKg, r.greenScore, b.venue, b.fnb, b.transport, b.materials]
  );
}

