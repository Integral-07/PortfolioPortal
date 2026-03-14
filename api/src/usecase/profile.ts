import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from '../db/client'
import {
  findAllProfiles,
  findProfileById,
  findProfileByUserId,
  insertProfile,
  updateProfileByUserId,
  deleteProfileByUserId,
} from '../repository/profile'
import type { PostProfileRequest, PutProfileRequest } from '../types/profiles'

export async function getProfiles(db: DrizzleDb) {
  return findAllProfiles(db)
}

export async function getProfileById(db: DrizzleDb, id: string) {
  const profile = await findProfileById(db, id)
  if (!profile) throw new HTTPException(404, { message: 'Profile not found' })
  return profile
}

export async function getMyProfile(db: DrizzleDb, userId: string) {
  const profile = await findProfileByUserId(db, userId)
  if (!profile) throw new HTTPException(404, { message: 'Profile not found' })
  return profile
}

export async function createProfile(db: DrizzleDb, userId: string, body: PostProfileRequest) {
  if (!body.name) throw new HTTPException(400, { message: 'name は必須です' })
  const existing = await findProfileByUserId(db, userId)
  if (existing) throw new HTTPException(409, { message: 'プロフィールはすでに存在します' })
  return insertProfile(db, { userId, ...body })
}

export async function updateProfileById(db: DrizzleDb, userId: string, body: PutProfileRequest) {
  const existing = await findProfileByUserId(db, userId)
  if (!existing) throw new HTTPException(404, { message: 'Profile not found' })
  const updated = await updateProfileByUserId(db, userId, body)
  return updated!
}

export async function deleteProfileById(db: DrizzleDb, userId: string) {
  const existing = await findProfileByUserId(db, userId)
  if (!existing) throw new HTTPException(404, { message: 'Profile not found' })
  await deleteProfileByUserId(db, userId)
  return { id: existing.id }
}
