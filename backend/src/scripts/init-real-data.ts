#!/usr/bin/env node
/**
 * Initialize database with REAL data from public APIs
 * No mock/dummy data - only verified real sources
 */

import { initializeRealData } from '../services/real-data-fetcher.service';
import { logger } from '../utils/logger';

async function main() {
  try {
    logger.info('='.repeat(60));
    logger.info('Initializing database with REAL data from public APIs');
    logger.info('='.repeat(60));

    await initializeRealData();

    logger.info('='.repeat(60));
    logger.info('✅ Real data initialization completed successfully');
    logger.info('='.repeat(60));
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to initialize real data:', error);
    process.exit(1);
  }
}

main();

