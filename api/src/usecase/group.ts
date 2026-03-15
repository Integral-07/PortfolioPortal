import { HTTPException } from 'hono/http-exception'
import type { DrizzleDb } from '../db/client'
import {
  findGroupsByUserId,
  findGroupById,
  insertGroup,
  updateGroup,
  deleteGroup,
} from '../repository/group'

export async function getGroups(db: DrizzleDb, userId: string) {
  return findGroupsByUserId(db, userId)
}

export async function createGroup(db: DrizzleDb, userId: string, name: string) {
  if (!name.trim()) throw new HTTPException(400, { message: 'name は必須です' })
  return insertGroup(db, userId, name.trim())
}

export async function updateGroupById(db: DrizzleDb, userId: string, id: string, name: string) {
  const group = await findGroupById(db, id)
  if (!group) throw new HTTPException(404, { message: 'グループが見つかりません' })
  if (group.userId !== userId) throw new HTTPException(403, { message: '権限がありません' })
  if (!name.trim()) throw new HTTPException(400, { message: 'name は必須です' })
  return updateGroup(db, id, name.trim())
}

export async function deleteGroupById(db: DrizzleDb, userId: string, id: string) {
  const group = await findGroupById(db, id)
  if (!group) throw new HTTPException(404, { message: 'グループが見つかりません' })
  if (group.userId !== userId) throw new HTTPException(403, { message: '権限がありません' })
  await deleteGroup(db, id)
  return { id }
}
