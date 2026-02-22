import fs from 'fs';
import path from 'path';
import { pool, query, transaction } from '../config/database';
import { logger } from '../utils/logger';

const SEEDS_DIR = path.join(__dirname);

async function runSeed(filename: string): Promise<void> {
  const filePath = path.join(SEEDS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  logger.info(`Running seed: ${filename}`);
  
  await transaction(async (client) => {
    await client.query(sql);
  });
  
  logger.info(`Completed seed: ${filename}`);
}

export async function runSeeds(): Promise<void> {
  try {
    logger.info('Starting database seeding...');
    
    // Check if roles already exist (idempotent check)
    const existingRoles = await query('SELECT COUNT(*) as count FROM roles');
    
    if (parseInt(existingRoles[0]?.count || '0', 10) > 0) {
      logger.info('Seed data already exists, skipping...');
      return;
    }
    
    // Run seed files
    const seedFiles = fs.readdirSync(SEEDS_DIR)
      .filter(f => f.includes('seed') && f.endsWith('.sql'))
      .sort();
    
    for (const file of seedFiles) {
      await runSeed(file);
    }
    
    logger.info('Seeding completed successfully');
  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runSeeds()
    .then(() => {
      logger.info('Seeds completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeds failed:', error);
      process.exit(1);
    });
}

