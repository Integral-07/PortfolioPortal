import { verifyToken } from '@clerk/backend'
import type { MiddlewareHandler } from 'hono'

export const authMiddleware = (): MiddlewareHandler<{
  Bindings: { CLERK_SECRET_KEY: string; CLERK_JWT_KEY: string }
  Variables: { userId: string }
}> =>
  async (c, next) => {
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return c.json({ error: { message: '認証が必要です' } }, { status: 401 })
    }

    const payload = await verifyToken(token, {
      secretKey: c.env.CLERK_SECRET_KEY,
      jwtKey: c.env.CLERK_JWT_KEY,
    })
    c.set('userId', payload.sub)
    await next()
  }
