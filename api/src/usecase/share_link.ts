import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from '../db/client'
import { findProfileByUserId } from '../repository/profile'
import {
  insertShareLink,
  findShareLinkByToken,
  findShareLinkByProfileId,
} from '../repository/share_link'

function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('')
}

export async function getOrCreateShareLink(db: DrizzleDb, userId: string) {
  const profile = await findProfileByUserId(db, userId)
  if (!profile) throw new HTTPException(404, { message: 'Profile not found' })

  const existing = await findShareLinkByProfileId(db, profile.id)
  if (existing) return existing

  const token = generateToken()
  return insertShareLink(db, profile.id, token)
}

export async function resolveShareLink(db: DrizzleDb, token: string) {
  const result = await findShareLinkByToken(db, token)
  if (!result) throw new HTTPException(404, { message: 'リンクが見つかりません' })
  return result.profile
}
