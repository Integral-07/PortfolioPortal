import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from '../db/client'
import { findProfileByUserId } from '../repository/profile'
import { findDefaultGroupByUserId } from '../repository/group'
import {
  findFieldsByProfileId,
  findFieldById,
  insertField,
  updateField,
  deleteField,
  findGroupIdsByFieldId,
  setFieldGroupVisibility,
} from '../repository/profile_field'

export async function getFields(db: DrizzleDb, userId: string) {
  const profile = await findProfileByUserId(db, userId)
  if (!profile) throw new HTTPException(404, { message: 'プロフィールが見つかりません' })
  const fields = await findFieldsByProfileId(db, profile.id)
  return Promise.all(
    fields.map(async (field) => ({
      ...field,
      groupIds: await findGroupIdsByFieldId(db, field.id),
    })),
  )
}

export async function createField(
  db: DrizzleDb,
  userId: string,
  data: { label: string; body: string; groupIds?: string[] },
) {
  const profile = await findProfileByUserId(db, userId)
  if (!profile) throw new HTTPException(404, { message: 'プロフィールが見つかりません' })
  const field = await insertField(db, profile.id, { label: data.label, body: data.body })
  let groupIds = data.groupIds ?? []
  if (groupIds.length === 0) {
    const defaultGroup = await findDefaultGroupByUserId(db, userId)
    if (defaultGroup) groupIds = [defaultGroup.id]
  }
  await setFieldGroupVisibility(db, field.id, groupIds)
  return { ...field, groupIds }
}

export async function updateFieldById(
  db: DrizzleDb,
  userId: string,
  fieldId: string,
  data: { label?: string; body?: string; groupIds?: string[] },
) {
  const profile = await findProfileByUserId(db, userId)
  if (!profile) throw new HTTPException(404, { message: 'プロフィールが見つかりません' })
  const field = await findFieldById(db, fieldId)
  if (!field) throw new HTTPException(404, { message: 'フィールドが見つかりません' })
  if (field.profileId !== profile.id) throw new HTTPException(403, { message: '権限がありません' })
  const updated = await updateField(db, fieldId, { label: data.label, body: data.body })
  if (data.groupIds !== undefined) await setFieldGroupVisibility(db, fieldId, data.groupIds)
  const groupIds = data.groupIds ?? (await findGroupIdsByFieldId(db, fieldId))
  return { ...updated!, groupIds }
}

export async function deleteFieldById(db: DrizzleDb, userId: string, fieldId: string) {
  const profile = await findProfileByUserId(db, userId)
  if (!profile) throw new HTTPException(404, { message: 'プロフィールが見つかりません' })
  const field = await findFieldById(db, fieldId)
  if (!field) throw new HTTPException(404, { message: 'フィールドが見つかりません' })
  if (field.profileId !== profile.id) throw new HTTPException(403, { message: '権限がありません' })
  await deleteField(db, fieldId)
  return { id: fieldId }
}
