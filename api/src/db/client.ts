import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../../../db/src/schema'

export type DrizzleDb = ReturnType<typeof createDb>

export function createDb(connectionString: string) {
  const client = postgres(connectionString)
  return drizzle(client, { schema })
}
