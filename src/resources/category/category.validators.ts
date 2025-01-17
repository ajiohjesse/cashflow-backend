import { z } from 'zod';

export const categoryParamsSchema = z.object({
  id: z.string().uuid(),
});

export const selectCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().date(),
  updatedAt: z.string().date(),
  userId: z.string().uuid(),
});

export type SelectCategoryDTO = z.infer<typeof selectCategorySchema>;

export const insertCategorySchema = z.object({
  name: z.string().trim().min(2),
});

export type InsertCategoryDTO = z.infer<typeof insertCategorySchema>;

export const categoryWithStatSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  totalTransactions: z.number(),
});

export type CategoryWithStatDTO = z.infer<typeof categoryWithStatSchema>;
