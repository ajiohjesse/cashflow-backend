import { inflowTable } from '@/database/schemas';
import { sql, SQL } from 'drizzle-orm';
import type { OverviewInterval } from './overview.validators';

const periodNameMap: Record<OverviewInterval, string> = {
  day: 'Today',
  week: 'This week',
  month: 'This month',
  year: 'This year',
};

export function getOverviewFilterQuery(
  interval: OverviewInterval,
  startDate?: string,
  endDate?: string
): {
  query: SQL<{}>;
  period: string;
} {
  if (startDate) {
    const effectiveEndDate = endDate || startDate;
    return {
      query: sql`
      DATE(${inflowTable.createdAt}) >= Date(${startDate}) 
      AND DATE(${inflowTable.createdAt}) <= Date(${effectiveEndDate})
    `,
      period: calculatePeriod(startDate, effectiveEndDate),
    };
  }

  const intervalQueryMap: Record<OverviewInterval, SQL<{}>> = {
    day: sql`
      DATE(${inflowTable.createdAt}) = CURRENT_DATE
    `,
    week: sql`
      DATE(${inflowTable.createdAt}) >= CURRENT_DATE - INTERVAL '1 day' * EXTRACT(DOW FROM CURRENT_DATE)::int
      AND DATE(${inflowTable.createdAt}) < CURRENT_DATE + INTERVAL '1 day' * (7 - EXTRACT(DOW FROM CURRENT_DATE)::int)
    `,
    month: sql`
      DATE(${inflowTable.createdAt}) >= DATE_TRUNC('month', CURRENT_DATE)
      AND DATE(${inflowTable.createdAt}) < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    `,
    year: sql`
      DATE(${inflowTable.createdAt}) >= DATE_TRUNC('year', CURRENT_DATE)
      AND DATE(${inflowTable.createdAt}) < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'
    `,
  };

  return {
    query: intervalQueryMap[interval],
    period: periodNameMap[interval],
  };
}

function calculatePeriod(startDate: string, endDate: string) {
  const dateFormater = new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
  });

  if (startDate === endDate) {
    return dateFormater.format(new Date(startDate));
  }

  return `${dateFormater.format(new Date(startDate))} - ${dateFormater.format(new Date(endDate))}`;
}
