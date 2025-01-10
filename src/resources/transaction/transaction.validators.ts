import { z } from 'zod';
import { selectCategorySchema } from '../category/category.validators';

export const selectTransactionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
  amount: z.number(),
  categoryId: z.string().uuid(),
  description: z.string().nullable(),
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
