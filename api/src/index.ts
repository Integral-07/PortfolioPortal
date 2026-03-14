import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from './db/client'
import { databaseMiddleware } from './middleware/database'
import { getProfiles, getProfileById, createProfile, updateProfileById, deleteProfileById } from './usecase/profile'
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
}

interface Variables {
  db: DrizzleDb
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

    .post('/api/profiles', async (c) => {
      const db = c.get('db')
      const body = await c.req.json<PostProfileRequest>()
      const profile = await createProfile(db, body)
      return c.json<PostProfileResponse>(profile)
    })

    .put('/api/profiles/:id', async (c) => {
      const db = c.get('db')
      const id = c.req.param('id')
      const body = await c.req.json<PutProfileRequest>()
      const profile = await updateProfileById(db, id, body)
      return c.json<PutProfileResponse>(profile)
    })

    .delete('/api/profiles/:id', async (c) => {
      const db = c.get('db')
      const id = c.req.param('id')
      const result = await deleteProfileById(db, id)
      return c.json<DeleteProfileResponse>(result)
    })

const app = createApp()
export default app
