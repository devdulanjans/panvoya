import mysql from 'mysql2/promise';

const globalForDb = globalThis;

export const pool =
  globalForDb.mysqlPool ||
  mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 60000,
    dateStrings: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.mysqlPool = pool;
}

export async function query(sql, params = [], runner = pool) {
  const [rows] = await runner.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = [], runner = pool) {
  const rows = await query(sql, params, runner);
  return rows[0] || null;
}

export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export function toJson(value) {
  return value === undefined || value === null ? null : JSON.stringify(value);
}

export function parseJson(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

// ContentItem rows store their per-section fields inside the `data` JSON
// column; every read needs the same parse, so centralize it here.
export function mapContentItem(row) {
  if (!row) return null;
  return { ...row, data: parseJson(row.data) };
}

export function mapContentChange(row) {
  if (!row) return null;
  return { ...row, payload: parseJson(row.payload) };
}

// Pulls columns aliased with `${prefix}fieldName` (from a JOIN) into a nested
// object under `targetKey`, e.g. nestPrefixed(row, 'submitter_', 'submitter')
// turns { submitter_id, submitter_name } into { submitter: { id, name } }.
export function nestPrefixed(row, prefix, targetKey) {
  const nested = {};
  let has = false;
  const rest = {};
  Object.keys(row).forEach((key) => {
    if (key.startsWith(prefix)) {
      has = true;
      nested[key.slice(prefix.length)] = row[key];
    } else {
      rest[key] = row[key];
    }
  });
  rest[targetKey] = has ? nested : null;
  return rest;
}
