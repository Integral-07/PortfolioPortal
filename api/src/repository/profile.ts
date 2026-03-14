import { eq } from 'drizzle-orm'
import type { DrizzleDb } from '../db/client'
import { profiles } from '../../../db/src/schema'

export async function findAllProfiles(db: DrizzleDb) {
  return db.select().from(profiles)
}

export async function findProfileById(db: DrizzleDb, id: string) {
  const result = await db.select().from(profiles).where(eq(profiles.id, id))
  return result[0] ?? null
}

export async function insertProfile(
  db: DrizzleDb,
  data: { name: string; qualifications?: string | null; career?: string | null },
) {
  const result = await db.insert(profiles).values(data).returning()
  return result[0]
}

export async function updateProfile(
  db: DrizzleDb,
  id: string,
  data: { name?: string; qualifications?: string | null; career?: string | null },
) {
  const result = await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.id, id))
    .returning()
  return result[0] ?? null
}

export async function deleteProfile(db: DrizzleDb, id: string) {
  const result = await db.delete(profiles).where(eq(profiles.id, id)).returning()
  return result[0] ?? null
}
