import { and, eq } from 'drizzle-orm'
import type { DrizzleDb } from '../db/client'
import { groups } from '../../../db/src/schema'

export async function findGroupsByUserId(db: DrizzleDb, userId: string) {
  return db.select().from(groups).where(eq(groups.userId, userId))
}

export async function findGroupById(db: DrizzleDb, id: string) {
  const result = await db.select().from(groups).where(eq(groups.id, id))
  return result[0] ?? null
}

export async function findDefaultGroupByUserId(db: DrizzleDb, userId: string) {
  const result = await db
    .select()
    .from(groups)
    .where(and(eq(groups.userId, userId), eq(groups.isDefault, true)))
  return result[0] ?? null
}

export async function insertGroup(db: DrizzleDb, userId: string, name: string, isDefault = false) {
  const result = await db.insert(groups).values({ userId, name, isDefault }).returning()
  return result[0]
}

export async function updateGroup(db: DrizzleDb, id: string, name: string) {
  const result = await db
    .update(groups)
    .set({ name, updatedAt: new Date() })
    .where(eq(groups.id, id))
    .returning()
  return result[0] ?? null
}

export async function deleteGroup(db: DrizzleDb, id: string) {
  const result = await db.delete(groups).where(eq(groups.id, id)).returning()
  return result[0] ?? null
}
