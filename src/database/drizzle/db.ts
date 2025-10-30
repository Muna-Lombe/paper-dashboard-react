import { drizzle } from 'drizzle-orm/d1';
import { D1Database } from '@cloudflare/workers-types/experimental';
import * as schema from '../../../drizzle/schema';

export function getDrizzleDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
