import { db } from '@/database';
import { inflowTable, outflowTable } from '@/database/schemas';
import { and, eq, sql } from 'drizzle-orm';
import type { OverviewDTO } from './overview.validators';

export class OverviewService {
  getOverview = async ({
    userId,
  }: {
    userId: string;
  }): Promise<OverviewDTO> => {
    //get overview for the current day by default and for the date range if passed

    const inflows = await db.query.inflowTable.findMany({
      where: and(
        eq(inflowTable.userId, userId),
        sql`DATE(${inflowTable.createdAt}) = CURRENT_DATE`
      ),
      with: {
        category: true,
      },
    });

    const outflows = await db.query.outflowTable.findMany({
      where: and(
        eq(outflowTable.userId, userId),
        sql`DATE(${outflowTable.createdAt}) = CURRENT_DATE`
      ),
      with: {
        category: true,
      },
    });

    const totalInflowAmount = inflows.reduce(
      (total, inflow) => total + inflow.amount,
      0
    );

    const totalOutflowAmount = outflows.reduce(
      (total, outflow) => total + outflow.amount,
      0
    );

    const netExpense = totalInflowAmount - totalOutflowAmount;
    const latestInflows = inflows.slice(0, 5);
    const latestOutflows = outflows.slice(0, 5);

    return {
      totalInflowAmount,
      totalOutflowAmount,
      netExpense,
      latestInflows,
      latestOutflows,
      period: new Date().toISOString(),
    };
  };
}
