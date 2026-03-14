import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from '../db/client'
import { findAllProfiles, findProfileById, insertProfile, updateProfile, deleteProfile } from '../repository/profile'
import type { PostProfileRequest, PutProfileRequest } from '../types/profiles'

export async function getProfiles(db: DrizzleDb) {
  return findAllProfiles(db)
}

export async function getProfileById(db: DrizzleDb, id: string) {
  const profile = await findProfileById(db, id)
  if (!profile) throw new HTTPException(404, { message: 'Profile not found' })
  return profile
}

export async function createProfile(db: DrizzleDb, body: PostProfileRequest) {
  if (!body.name) throw new HTTPException(400, { message: 'name は必須です' })
  return insertProfile(db, body)
}

export async function updateProfileById(db: DrizzleDb, id: string, body: PutProfileRequest) {
  const existing = await findProfileById(db, id)
  if (!existing) throw new HTTPException(404, { message: 'Profile not found' })
  const updated = await updateProfile(db, id, body)
  return updated!
}

export async function deleteProfileById(db: DrizzleDb, id: string) {
  const existing = await findProfileById(db, id)
  if (!existing) throw new HTTPException(404, { message: 'Profile not found' })
  await deleteProfile(db, id)
  return { id }
}
