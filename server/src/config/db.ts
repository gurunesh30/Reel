/**
 * PostgreSQL Database Provider & Connection Pool
 * Uses native pg driver (no ORM) connecting to the primary Docker PostgreSQL container.
 */

import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgres://postgres:postgrespassword@localhost:5432/cinema_booking';

const poolConfig: PoolConfig = {
  connectionString,
  max: 20, // Maximum active connections in pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5s if connection cannot be established
  ssl:
    process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('localhost')
      ? { rejectUnauthorized: false }
      : false,
};

// Primary PostgreSQL connection pool instance
export const pool = new Pool(poolConfig);

pool.on('error', (err: Error) => {
  console.error('[PostgreSQL Pool Error]: Unexpected error on idle database client', err);
});

/**
 * Execute a parameterized SQL query using an available pool client
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SQL Query] (${duration}ms): ${text.replace(/\s+/g, ' ').trim()}`);
    }
    return res;
  } catch (error) {
    console.error(`[SQL Error] Query failed: ${text}`, error);
    throw error;
  }
}

/**
 * Acquire a dedicated client from the pool for multi-statement ACID transactions
 */
export async function getTransactionClient() {
  const client = await pool.connect();
  const startTransaction = async () => client.query('BEGIN');
  const commitTransaction = async () => client.query('COMMIT');
  const rollbackTransaction = async () => client.query('ROLLBACK');
  const release = () => client.release();

  return {
    client,
    startTransaction,
    commitTransaction,
    rollbackTransaction,
    release,
  };
}

/**
 * Database health check verifying active connectivity to the PostgreSQL container
 */
export async function checkDatabaseHealth(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await pool.query('SELECT 1 AS health');
    return {
      status: 'healthy',
      latencyMs: Date.now() - start,
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
