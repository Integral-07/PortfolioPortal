import type { InferSelectModel } from 'drizzle-orm'
import type { profiles } from '../../../db/src/schema'

export type Profile = InferSelectModel<typeof profiles>

export type GetProfilesResponse = { profiles: Profile[] }
export type GetProfileResponse = Profile
export type PostProfileRequest = { name: string }
export type PostProfileResponse = Profile
export type PutProfileRequest = { name?: string; shareSlug?: string }
export type PutProfileResponse = Profile
export type DeleteProfileResponse = { id: string }
