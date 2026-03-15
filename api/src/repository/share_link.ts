import { and, eq, isNull } from 'drizzle-orm'
import type { DrizzleDb } from '../db/client'
import { shareLinks, profiles } from '../../../db/src/schema'

export async function insertShareLink(
  db: DrizzleDb,
  profileId: string,
  token: string,
  groupId?: string,
) {
  const result = await db
    .insert(shareLinks)
    .values({ profileId, token, groupId: groupId ?? null })
    .returning()
  return result[0]
}

export async function findShareLinkByToken(db: DrizzleDb, token: string) {
  const result = await db
    .select({
      token: shareLinks.token,
      groupId: shareLinks.groupId,
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
    .where(and(eq(shareLinks.profileId, profileId), isNull(shareLinks.groupId)))
  return result[0] ?? null
}

export async function findShareLinkByProfileAndGroup(
  db: DrizzleDb,
  profileId: string,
  groupId: string,
) {
  const result = await db
    .select()
    .from(shareLinks)
    .where(and(eq(shareLinks.profileId, profileId), eq(shareLinks.groupId, groupId)))
  return result[0] ?? null
}
