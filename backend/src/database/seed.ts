import fs from 'fs';
import path from 'path';
import { query, pool } from './pool.js';
import { logger } from '../utils/logger.js';

async function runSeed() {
  try {
    const seedPath = path.resolve(process.cwd(), '../database/seeds/001_seed_data.sql');
    const sql = fs.readFileSync(seedPath, 'utf-8');
    logger.info('Running database synthetic seeding...');
    await query(sql);
    logger.info('Database seeding completed successfully!');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
