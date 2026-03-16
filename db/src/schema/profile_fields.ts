import { pgTable, uuid, text, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { groups } from './groups'

export const profileFields = pgTable('profile_fields', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('field'),
  label: text('label').notNull(),
  body: text('body').notNull().default(''),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const fieldGroupVisibility = pgTable(
  'field_group_visibility',
  {
    fieldId: uuid('field_id').notNull().references(() => profileFields.id, { onDelete: 'cascade' }),
    groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.fieldId, t.groupId] })],
)
