import { db } from '@/database';
import {
  financialSummaryTable,
  inflowTable,
  outflowTable,
} from '@/database/schemas';
import { generateFinancialSummary } from '@/libraries/google-ai';
import { and, eq, sql } from 'drizzle-orm';
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

  getLastMonthFinancialSummary = async (userId: string): Promise<string> => {
    const summary = await db.query.financialSummaryTable.findFirst({
      where: and(
        eq(financialSummaryTable.userId, userId),
        sql`DATE_TRUNC('month', ${financialSummaryTable.period}) = DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'`
      ),
    });

    if (summary) {
      return summary.summary;
    }

    const monthlyInflows = await db.query.inflowTable.findMany({
      where: and(
        eq(inflowTable.userId, userId),
        sql`
      DATE(${inflowTable.createdAt}) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      AND DATE(${inflowTable.createdAt}) < DATE_TRUNC('month', CURRENT_DATE)
    `
      ),
      with: {
        category: true,
      },
    });

    const monthlyOutflows = await db.query.outflowTable.findMany({
      where: and(
        eq(outflowTable.userId, userId),
        sql`
      DATE(${outflowTable.createdAt}) >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      AND DATE(${outflowTable.createdAt}) < DATE_TRUNC('month', CURRENT_DATE)
    `
      ),
      with: {
        category: true,
      },
    });

    const generatedSummary = await generateFinancialSummary({
      inflows: monthlyInflows,
      outflows: monthlyOutflows,
    });

    const [insertedSummary] = await db
      .insert(financialSummaryTable)
      .values({
        userId,
        summary: generatedSummary,
        period: sql`DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'`,
      })
      .returning();

    return insertedSummary.summary;
  };
}
