import type { MiddlewareHandler } from 'hono'
import { createDb, type DrizzleDb } from '../db/client'

export const databaseMiddleware = (): MiddlewareHandler<{
  Bindings: { DATABASE_URL: string }
  Variables: { db: DrizzleDb }
}> =>
  async (c, next) => {
    const db = createDb(c.env.DATABASE_URL)
    c.set('db', db)
    await next()
  }
