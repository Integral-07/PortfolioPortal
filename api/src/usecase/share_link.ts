import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from '../db/client'
import { findProfileByUserId } from '../repository/profile'
import {
  insertShareLink,
  findShareLinkByToken,
  findShareLinkByProfileId,
  findShareLinkByProfileAndGroup,
} from '../repository/share_link'
import { findGroupById } from '../repository/group'
import { findFieldsByGroupId } from '../repository/profile_field'

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('')
}

export async function getOrCreateShareLink(
  db: DrizzleDb,
  userId: string,
  groupId?: string,
) {
  const profile = await findProfileByUserId(db, userId)
  if (!profile) throw new HTTPException(404, { message: 'Profile not found' })

  if (groupId) {
    const group = await findGroupById(db, groupId)
    if (!group) throw new HTTPException(404, { message: 'グループが見つかりません' })
    if (group.userId !== userId) throw new HTTPException(403, { message: '権限がありません' })
    const existing = await findShareLinkByProfileAndGroup(db, profile.id, groupId)
    if (existing) return existing
    return insertShareLink(db, profile.id, generateToken(), groupId)
  }

  const existing = await findShareLinkByProfileId(db, profile.id)
  if (existing) return existing
  return insertShareLink(db, profile.id, generateToken())
}

export async function resolveShareLink(db: DrizzleDb, token: string) {
  const result = await findShareLinkByToken(db, token)
  if (!result) throw new HTTPException(404, { message: 'リンクが見つかりません' })

  const fields = result.groupId
    ? await findFieldsByGroupId(db, result.groupId)
    : []

  return {
    profile: result.profile,
    fields,
    groupId: result.groupId,
  }
}
