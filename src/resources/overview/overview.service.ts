import { db } from '@/database';
import { inflowTable, outflowTable } from '@/database/schemas';
import { and, eq } from 'drizzle-orm';
import { getOverviewFilterQuery } from './overview.helpers';
import type { OverviewDTO, OverviewParamsDTO } from './overview.validators';

export class OverviewService {
  getOverview = async ({
    userId,
    params,
  }: {
    userId: string;
    params: OverviewParamsDTO;
  }): Promise<OverviewDTO> => {
    const { interval = 'day', startDate, endDate } = params;
    const { query: intervalQuery, period } = getOverviewFilterQuery(
      interval,
      startDate,
      endDate
    );

    const inflows = await db.query.inflowTable.findMany({
      where: and(eq(inflowTable.userId, userId), intervalQuery),
      with: {
        category: true,
      },
    });

    const outflows = await db.query.outflowTable.findMany({
      where: and(eq(outflowTable.userId, userId), intervalQuery),
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

    const netTotal = totalInflowAmount - totalOutflowAmount;
    const latestInflows = inflows.slice(0, 5);
    const latestOutflows = outflows.slice(0, 5);

    return {
      totalInflowAmount,
      totalOutflowAmount,
      netTotal,
      latestInflows,
      latestOutflows,
      period,
    };
  };
}
