import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const shareLinks = pgTable('share_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  token: text('token').notNull().unique(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id'),  // 将来のグループ機能用
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
