/**
 * Seed initial data for Planner tier features
 * Run this after migration 009 to populate:
 * - Carbon offset projects
 * - Eco-friendly suppliers
 * - Industry benchmarks
 */

import { seedCarbonOffsets } from '../services/carbon-offset.service';
import { seedSuppliers } from '../services/supplier.service';
import { seedBenchmarks } from '../services/benchmark.service';
import { logger } from '../utils/logger';

async function seedPlannerData() {
  try {
    logger.info('🌱 Starting Planner tier data seeding...');

    // Seed carbon offset projects
    logger.info('📊 Seeding carbon offset projects...');
    await seedCarbonOffsets();
    logger.info('✅ Carbon offset projects seeded');

    // Seed suppliers
    logger.info('🏢 Seeding eco-friendly suppliers...');
    await seedSuppliers();
    logger.info('✅ Suppliers seeded');

    // Seed industry benchmarks
    logger.info('📈 Seeding industry benchmarks...');
    await seedBenchmarks();
    logger.info('✅ Industry benchmarks seeded');

    logger.info('🎉 Planner tier data seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedPlannerData();
}

export default seedPlannerData;

