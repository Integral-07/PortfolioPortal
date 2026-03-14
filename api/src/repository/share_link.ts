import { eq } from 'drizzle-orm'
import type { DrizzleDb } from '../db/client'
import { shareLinks, profiles } from '../../../db/src/schema'

export async function insertShareLink(db: DrizzleDb, profileId: string, token: string) {
  const result = await db.insert(shareLinks).values({ profileId, token }).returning()
  return result[0]
}

export async function findShareLinkByToken(db: DrizzleDb, token: string) {
  const result = await db
    .select({
      token: shareLinks.token,
      profile: profiles,
    })
    .from(shareLinks)
    .innerJoin(profiles, eq(shareLinks.profileId, profiles.id))
    .where(eq(shareLinks.token, token))
  return result[0] ?? null
}

export async function findShareLinkByProfileId(db: DrizzleDb, profileId: string) {
  const result = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.profileId, profileId))
  return result[0] ?? null
}
