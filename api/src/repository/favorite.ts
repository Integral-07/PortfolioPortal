import { and, eq } from 'drizzle-orm'
import type { DrizzleDb } from '../db/client'
import { favorites } from '../../../db/src/schema'

export async function findFavorite(db: DrizzleDb, userId: string, profileId: string) {
  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.profileId, profileId)))
  return result[0] ?? null
}

export async function findFavoritesByUserId(db: DrizzleDb, userId: string) {
  return db.select().from(favorites).where(eq(favorites.userId, userId))
}

export async function insertFavorite(db: DrizzleDb, userId: string, profileId: string) {
  const result = await db.insert(favorites).values({ userId, profileId }).returning()
  return result[0]
}

export async function deleteFavorite(db: DrizzleDb, userId: string, profileId: string) {
  const result = await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.profileId, profileId)))
    .returning()
  return result[0]
}
