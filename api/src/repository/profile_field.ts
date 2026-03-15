import { eq, inArray } from 'drizzle-orm'
import type { DrizzleDb } from '../db/client'
import { profileFields, fieldGroupVisibility } from '../../../db/src/schema'

export async function findFieldsByProfileId(db: DrizzleDb, profileId: string) {
  return db.select().from(profileFields).where(eq(profileFields.profileId, profileId))
}

export async function findFieldById(db: DrizzleDb, id: string) {
  const result = await db.select().from(profileFields).where(eq(profileFields.id, id))
  return result[0] ?? null
}

export async function insertField(
  db: DrizzleDb,
  profileId: string,
  data: { label: string; body: string; order?: number },
) {
  const result = await db.insert(profileFields).values({ profileId, ...data }).returning()
  return result[0]
}

export async function updateField(
  db: DrizzleDb,
  id: string,
  data: { label?: string; body?: string; order?: number },
) {
  const result = await db
    .update(profileFields)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profileFields.id, id))
    .returning()
  return result[0] ?? null
}

export async function deleteField(db: DrizzleDb, id: string) {
  const result = await db.delete(profileFields).where(eq(profileFields.id, id)).returning()
  return result[0] ?? null
}

export async function findGroupIdsByFieldId(db: DrizzleDb, fieldId: string) {
  const rows = await db
    .select({ groupId: fieldGroupVisibility.groupId })
    .from(fieldGroupVisibility)
    .where(eq(fieldGroupVisibility.fieldId, fieldId))
  return rows.map((r) => r.groupId)
}

export async function setFieldGroupVisibility(db: DrizzleDb, fieldId: string, groupIds: string[]) {
  await db.delete(fieldGroupVisibility).where(eq(fieldGroupVisibility.fieldId, fieldId))
  if (groupIds.length === 0) return
  await db.insert(fieldGroupVisibility).values(groupIds.map((groupId) => ({ fieldId, groupId })))
}

export async function findFieldsByGroupId(db: DrizzleDb, groupId: string) {
  const visibleFieldIds = await db
    .select({ fieldId: fieldGroupVisibility.fieldId })
    .from(fieldGroupVisibility)
    .where(eq(fieldGroupVisibility.groupId, groupId))

  if (visibleFieldIds.length === 0) return []

  return db
    .select()
    .from(profileFields)
    .where(inArray(profileFields.id, visibleFieldIds.map((r) => r.fieldId)))
}
