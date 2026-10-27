import fs from 'fs';
import path from 'path';
import { query, pool } from './pool.js';
import { logger } from '../utils/logger.js';

async function runMigrations() {
  try {
    const migrationPath = path.resolve(process.cwd(), '../database/migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    logger.info('Running database schema migration...');
    await query(sql);
    logger.info('Database schema migration completed successfully!');
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
