import pg from 'pg'
import "dotenv/config";

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export function query(text, params) {
  return pool.query(text, params)
}

export async function closePool() {
  await pool.end()
}
