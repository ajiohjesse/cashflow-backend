import { z } from 'zod';
import { selectTransactionSchema } from '../transaction/transaction.validators';

export const overviewSchema = z.object({
  totalInflowAmount: z.number(),
  totalOutflowAmount: z.number(),
  netExpense: z.number(),
  latestInflows: z.array(selectTransactionSchema),
  latestOutflows: z.array(selectTransactionSchema),
  period: z.string().openapi({ example: '2025-1-1' }),
});

export type OverviewDTO = z.infer<typeof overviewSchema>;
