import fs from 'fs';
import path from 'path';
import { pool, query, transaction } from '../config/database';
import { logger } from '../utils/logger';

const MIGRATIONS_DIR = path.join(__dirname);

interface Migration {
  id: number;
  name: string;
  appliedAt: Date;
}

async function ensureMigrationTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(): Promise<string[]> {
  const result = await query<Migration>('SELECT name FROM migrations ORDER BY id');
  return result.map(m => m.name);
}

async function runMigration(filename: string): Promise<void> {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  logger.info(`Running migration: ${filename}`);
  
  await transaction(async (client) => {
    // Run migration SQL
    await client.query(sql);
    
    // Record migration
    await client.query(
      'INSERT INTO migrations (name) VALUES ($1)',
      [filename]
    );
  });
  
  logger.info(`Completed migration: ${filename}`);
}

export async function runMigrations(): Promise<void> {
  try {
    logger.info('Starting database migrations...');
    
    // Ensure migrations table exists
    await ensureMigrationTable();
    
    // Get applied migrations
    const applied = await getAppliedMigrations();
    
    // Get all migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    // Run pending migrations
    let count = 0;
    for (const file of files) {
      if (!applied.includes(file)) {
        await runMigration(file);
        count++;
      }
    }
    
    if (count > 0) {
      logger.info(`Applied ${count} migration(s)`);
    } else {
      logger.info('No pending migrations');
    }
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migrations failed:', error);
      process.exit(1);
    });
}

