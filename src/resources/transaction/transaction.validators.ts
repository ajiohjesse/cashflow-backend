import { z } from 'zod';
import { selectCategorySchema } from '../category/category.validators';

export const selectTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  amount: z.number(),
  description: z.string().nullable(),
  categoryId: z.string().uuid(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
});

export type SelectTransactionDTO = z.infer<typeof selectTransactionSchema>;

export const selectTransactionWithCategorySchema = z.intersection(
  selectTransactionSchema,
  z.object({
    category: selectCategorySchema,
  })
);

export type SelectTransactionWithCategoryDTO = z.infer<
  typeof selectTransactionWithCategorySchema
>;

export const insertTransactionSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().openapi({ example: 1500 }),
  description: z.string().nullable(),
});

export type InsertTransactionDTO = z.infer<typeof insertTransactionSchema>;

export const transactionsQuerySchema = z.object({
  startDate: z
    .string()
    .trim()
    .optional()
    .refine(value => (value ? Boolean(Date.parse(value)) : true), {
      message: 'Invalid start date',
    })
    .openapi({ example: '2025-1-1' }),
  endDate: z
    .string()
    .trim()
    .optional()
    .refine(value => (value ? Boolean(Date.parse(value)) : true), {
      message: 'Invalid end date',
    })
    .openapi({ example: '2025-1-1' }),
  search: z.string().trim().optional().openapi({ example: 'Bought groceries' }),
  categories: z.string().trim().optional().openapi({
    example: '2,10,5',
    description: 'The ids of selected categories seperated by a dash (-)',
  }),
  type: z.enum(['inflow', 'outflow']),
  limit: z.coerce.number().int().positive().min(1).max(100).default(20),
  page: z.coerce.number().int().positive().default(1),
  sort: z
    .enum(['amount:asc', 'amount:desc', 'date:asc', 'date:desc'])
    .optional()
    .openapi({ example: 'amount:asc' }),
});

export type TransactionsQueryDTO = z.infer<typeof transactionsQuerySchema>;
