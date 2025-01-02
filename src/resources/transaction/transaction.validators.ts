import { z } from 'zod';

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
    category: z.object({
      id: z.string().uuid(),
      name: z.string(),
      createdAt: z.string().date(),
      updatedAt: z.string().date(),
      userId: z.string().uuid(),
    }),
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
