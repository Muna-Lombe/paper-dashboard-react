import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../../drizzle/schema';
export function getDrizzleDb(d1) {
    return drizzle(d1, { schema });
}
