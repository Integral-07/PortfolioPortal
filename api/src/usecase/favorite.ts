import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from '../db/client'
import { findFavorite, findFavoritesByUserId, insertFavorite, deleteFavorite } from '../repository/favorite'
import { findProfileById } from '../repository/profile'

export async function getFavorites(db: DrizzleDb, userId: string) {
  return findFavoritesByUserId(db, userId)
}

export async function toggleFavorite(db: DrizzleDb, userId: string, profileId: string) {
  const profile = await findProfileById(db, profileId)
  if (!profile) throw new HTTPException(404, { message: 'プロフィールが見つかりません' })

  const existing = await findFavorite(db, userId, profileId)
  if (existing) {
    await deleteFavorite(db, userId, profileId)
    return { favorited: false }
  } else {
    await insertFavorite(db, userId, profileId)
    return { favorited: true }
  }
}

export async function checkFavorite(db: DrizzleDb, userId: string, profileId: string) {
  const existing = await findFavorite(db, userId, profileId)
  return { favorited: !!existing }
}
