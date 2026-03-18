import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export const db =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL
  });

if (process.env.NODE_ENV !== "production") global.__pgPool = db;

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const res = await db.query(text, params);
  return res.rows as T[];
}