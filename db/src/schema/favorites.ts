import { pgTable, text, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const favorites = pgTable(
  'favorites',
  {
    userId: text('user_id').notNull(),
    profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.profileId] })],
)
