import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { tableId, timestamps } from './db.utils';

export const userTable = pgTable(
  'users',
  {
    id: tableId,
    googleId: text(),
    email: text().unique().notNull(),
    fullName: text().notNull(),
    passwordHash: text(),
    isEmailVerified: boolean()
      .notNull()
      .$defaultFn(() => false),
    metadata: jsonb().$type<{
      passwordResetToken: string;
    }>(),
    ...timestamps,
  },
  table => [
    {
      emailIndex: index('email_index').on(table.email),
    },
  ]
);

export const inflowCategoryTable = pgTable(
  'inflow_categories',
  {
    id: tableId,
    userId: uuid()
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
      }),
    name: text().notNull(),
    ...timestamps,
  },
  table => [
    {
      uniqueUserCategory: unique().on(table.userId, table.name),
    },
  ]
);

export const inflowTable = pgTable('inflows', {
  id: tableId,
  userId: uuid()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  amount: integer().notNull(),
  categoryId: uuid()
    .notNull()
    .references(() => inflowCategoryTable.id, {
      onDelete: 'cascade',
    }),
  description: text(),
  ...timestamps,
});

export const inflowRelations = relations(inflowTable, ({ one }) => ({
  category: one(inflowCategoryTable, {
    fields: [inflowTable.categoryId],
    references: [inflowCategoryTable.id],
  }),
}));

export const outflowCategoryTable = pgTable(
  'outflow_categories',
  {
    id: tableId,
    userId: uuid()
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'cascade',
      }),
    name: text().notNull(),
    ...timestamps,
  },
  table => [
    {
      uniqueUserCategory: unique('unique_user_category').on(
        table.userId,
        table.name
      ),
    },
  ]
);

export const outflowTable = pgTable('outflows', {
  id: tableId,
  userId: uuid()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  amount: integer().notNull(),
  categoryId: uuid()
    .notNull()
    .references(() => outflowCategoryTable.id, {
      onDelete: 'cascade',
    }),
  description: text(),
  ...timestamps,
});

export const outflowRelations = relations(outflowTable, ({ one }) => ({
  category: one(outflowCategoryTable, {
    fields: [outflowTable.categoryId],
    references: [outflowCategoryTable.id],
  }),
}));
