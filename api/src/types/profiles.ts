import type { InferSelectModel } from 'drizzle-orm'
import type { profiles } from '../../../db/src/schema'

export type Profile = InferSelectModel<typeof profiles>

export type GetProfilesResponse = { profiles: Profile[] }
export type GetProfileResponse = Profile
export type PostProfileRequest = { name: string; qualifications?: string; career?: string }
export type PostProfileResponse = Profile
export type PutProfileRequest = { name?: string; qualifications?: string; career?: string }
export type PutProfileResponse = Profile
export type DeleteProfileResponse = { id: string }
