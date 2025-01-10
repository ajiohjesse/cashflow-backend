import { z } from 'zod';
import { selectTransactionWithCategorySchema } from '../transaction/transaction.validators';

const OVERVIEW_INTERVALS = ['day', 'week', 'month', 'year'] as const;
export type OverviewInterval = (typeof OVERVIEW_INTERVALS)[number];

export const overviewSchema = z.object({
  totalInflowAmount: z.number(),
  totalOutflowAmount: z.number(),
  netTotal: z.number(),
  latestInflows: z.array(selectTransactionWithCategorySchema),
  latestOutflows: z.array(selectTransactionWithCategorySchema),
  period: z.string().openapi({ example: '2025-1-1', default: 'today' }),
});

export type OverviewDTO = z.infer<typeof overviewSchema>;

export const overviewQuerySchema = z.object({
  interval: z.enum(OVERVIEW_INTERVALS).optional(),
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
});

export type OverviewParamsDTO = z.infer<typeof overviewQuerySchema>;
