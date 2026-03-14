import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from './db/client'
import { databaseMiddleware } from './middleware/database'
import { authMiddleware } from './middleware/auth'
import { getProfiles, getProfileById, getMyProfile, createProfile, updateProfileById, deleteProfileById } from './usecase/profile'
import type {
  GetProfilesResponse,
  GetProfileResponse,
  PostProfileRequest,
  PostProfileResponse,
  PutProfileRequest,
  PutProfileResponse,
  DeleteProfileResponse,
} from './types/profiles'

interface Bindings {
  DATABASE_URL: string
  CLERK_SECRET_KEY: string
  CLERK_JWT_KEY: string
}

interface Variables {
  db: DrizzleDb
  userId: string
}

export const createApp = () =>
  new Hono<{ Bindings: Bindings; Variables: Variables }>()

    .use('*', logger())

    .use('*', cors({ origin: ['http://localhost:5173'] }))

    .use('*', databaseMiddleware())

    .onError((err, c) => {
      console.error(err)
      if (err instanceof HTTPException) return err.getResponse()
      return c.json({ error: { message: err.message } }, { status: 500 })
    })

    .get('/api/health', (c) => c.json({ status: 'ok' }))

    // ゲスト可: プロフィール一覧・詳細
    .get('/api/profiles', async (c) => {
      const db = c.get('db')
      const profiles = await getProfiles(db)
      return c.json<GetProfilesResponse>({ profiles })
    })

    .get('/api/profiles/:id', async (c) => {
      const db = c.get('db')
      const id = c.req.param('id')
      const profile = await getProfileById(db, id)
      return c.json<GetProfileResponse>(profile)
    })

    // 以下は認証必須
    .use('/api/profiles/*', authMiddleware())

    .get('/api/profiles/me', async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const profile = await getMyProfile(db, userId)
      return c.json<GetProfileResponse>(profile)
    })

    .post('/api/profiles', async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const body = await c.req.json<PostProfileRequest>()
      const profile = await createProfile(db, userId, body)
      return c.json<PostProfileResponse>(profile)
    })

    .put('/api/profiles/me', async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const body = await c.req.json<PutProfileRequest>()
      const profile = await updateProfileById(db, userId, body)
      return c.json<PutProfileResponse>(profile)
    })

    .delete('/api/profiles/me', async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const result = await deleteProfileById(db, userId)
      return c.json<DeleteProfileResponse>(result)
    })

const app = createApp()
export default app
