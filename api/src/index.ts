import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from './db/client'
import { databaseMiddleware } from './middleware/database'
import { authMiddleware } from './middleware/auth'
import { getProfiles, getProfileById, getMyProfile, createProfile, updateProfileById, deleteProfileById } from './usecase/profile'
import { getOrCreateShareLink, resolveShareLink } from './usecase/share_link'
import { getGroups, createGroup, updateGroupById, deleteGroupById } from './usecase/group'
import { getFields, createField, updateFieldById, deleteFieldById, reorderFieldsByIds } from './usecase/profile_field'
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

    // profiles（ゲスト可）
    .get('/api/profiles', async (c) => {
      const db = c.get('db')
      const profiles = await getProfiles(db)
      return c.json<GetProfilesResponse>({ profiles })
    })

    .get('/api/profiles/me', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const profile = await getMyProfile(db, userId)
      return c.json<GetProfileResponse>(profile)
    })

    .get('/api/profiles/:id', async (c) => {
      const db = c.get('db')
      const id = c.req.param('id')
      const profile = await getProfileById(db, id)
      return c.json<GetProfileResponse>(profile)
    })

    .post('/api/profiles', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const body = await c.req.json<PostProfileRequest>()
      const profile = await createProfile(db, userId, body)
      return c.json<PostProfileResponse>(profile)
    })

    .put('/api/profiles/me', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const body = await c.req.json<PutProfileRequest>()
      const profile = await updateProfileById(db, userId, body)
      return c.json<PutProfileResponse>(profile)
    })

    .delete('/api/profiles/me', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const result = await deleteProfileById(db, userId)
      return c.json<DeleteProfileResponse>(result)
    })

    // profile fields
    .get('/api/profile-fields', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const fields = await getFields(db, userId)
      return c.json({ fields })
    })

    .post('/api/profile-fields', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const body = await c.req.json<{ label: string; body?: string; groupIds?: string[]; type?: string }>()
      const field = await createField(db, userId, body)
      return c.json(field, { status: 201 })
    })

    .put('/api/profile-fields/reorder', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const { ids } = await c.req.json<{ ids: string[] }>()
      await reorderFieldsByIds(db, userId, ids)
      return c.json({ ok: true })
    })

    .put('/api/profile-fields/:id', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const id = c.req.param('id')
      const body = await c.req.json<{ label?: string; body?: string; groupIds?: string[]; type?: string }>()
      const field = await updateFieldById(db, userId, id, body)
      return c.json(field)
    })

    .delete('/api/profile-fields/:id', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const id = c.req.param('id')
      const result = await deleteFieldById(db, userId, id)
      return c.json(result)
    })

    // groups
    .get('/api/groups', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const groupList = await getGroups(db, userId)
      return c.json({ groups: groupList })
    })

    .post('/api/groups', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const { name } = await c.req.json<{ name: string }>()
      const group = await createGroup(db, userId, name)
      return c.json(group, { status: 201 })
    })

    .put('/api/groups/:id', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const id = c.req.param('id')
      const { name } = await c.req.json<{ name: string }>()
      const group = await updateGroupById(db, userId, id, name)
      return c.json(group)
    })

    .delete('/api/groups/:id', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const id = c.req.param('id')
      const result = await deleteGroupById(db, userId, id)
      return c.json(result)
    })

    // share links
    .post('/api/share-links', authMiddleware(), async (c) => {
      const db = c.get('db')
      const userId = c.get('userId')
      const body = await c.req.json<{ groupId?: string }>().catch(() => ({}))
      const shareLink = await getOrCreateShareLink(db, userId, body.groupId)
      return c.json({ token: shareLink.token })
    })

    .get('/api/share/:token', async (c) => {
      const db = c.get('db')
      const token = c.req.param('token')
      const result = await resolveShareLink(db, token)
      return c.json(result)
    })

const app = createApp()
export default app
