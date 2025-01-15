import { db } from '@/database';
import {
  inflowCategoryTable,
  inflowTable,
  outflowTable,
} from '@/database/schemas';
import { PublicError } from '@/libraries/error.lib';
import { and, count, desc, eq, ilike, inArray, sql, SQL } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import { outflowCategoryTable } from './../../database/schemas';
import {
  type InsertTransactionDTO,
  type SelectTransactionDTO,
  type SelectTransactionWithCategoryDTO,
  type TransactionsQueryDTO,
} from './transaction.validators';

interface ICreateTransaction {
  userId: string;
  type: 'inflow' | 'outflow';
  transaction: InsertTransactionDTO;
}

export class TransactionService {
  createTransaction = async ({
    transaction,
    type,
    userId,
  }: ICreateTransaction): Promise<SelectTransactionDTO> => {
    const targetTransactionTable =
      type === 'inflow' ? inflowTable : outflowTable;
    const targetCategoryTable =
      type === 'inflow' ? inflowCategoryTable : outflowCategoryTable;

    const [category] = await db
      .select()
      .from(targetCategoryTable)
      .where(eq(targetCategoryTable.id, transaction.categoryId));

    if (!category) {
      throw new PublicError(StatusCodes.BAD_REQUEST, 'Invalid category id');
    }

    const [createdTransaction] = await db
      .insert(targetTransactionTable)
      .values({
        userId,
        ...transaction,
      })
      .returning();

    return createdTransaction;
  };

  getTransactions = async ({
    userId,
    type,
    search,
    categories,
    startDate,
    endDate,
    limit,
    page,
    dateSort,
    amountSort,
  }: TransactionsQueryDTO & { userId: string }) => {
    const targetTransactionTable =
      type === 'inflow' ? inflowTable : outflowTable;
    const targetCategoryTable =
      type === 'inflow' ? inflowCategoryTable : outflowCategoryTable;

    const filters: SQL[] = [eq(targetTransactionTable.userId, userId)];

    if (search) {
      filters.push(ilike(targetTransactionTable.description, `%${search}%`));
    }

    if (categories) {
      const categoryArray = categories.split(',').map(c => c.toLowerCase());
      if (categoryArray.length > 0) {
        filters.push(
          inArray(sql`lower(${targetCategoryTable.name})`, categoryArray)
        );
      }
    }

    if (startDate) {
      if (endDate) {
        if (startDate === endDate) {
          filters.push(
            sql`DATE_TRUNC('day', ${targetTransactionTable.createdAt}) = DATE_TRUNC('day', DATE(${startDate}))`
          );
        } else {
          filters.push(sql`DATE_TRUNC('day', ${targetTransactionTable.createdAt}) >= DATE_TRUNC('day', DATE(${startDate}))
          AND DATE_TRUNC('day', ${targetTransactionTable.createdAt}) <= DATE_TRUNC('day', DATE(${endDate}))`);
        }
      } else {
        filters.push(
          sql`DATE_TRUNC('day', ${targetTransactionTable.createdAt}) = DATE_TRUNC('day', DATE(${startDate}))`
        );
      }
    }

    const data = (await db
      .select()
      .from(targetTransactionTable)
      .innerJoin(
        targetCategoryTable,
        eq(targetCategoryTable.id, targetTransactionTable.categoryId)
      )
      .where(and(...filters))
      .orderBy(desc(targetTransactionTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)) as any[];

    const transactions: SelectTransactionWithCategoryDTO[] = data.map(d => {
      if (type === 'inflow') {
        return {
          ...d.inflows,
          category: d.inflow_categories,
        };
      } else {
        return {
          ...d.outflows,
          category: d.outflow_categories,
        };
      }
    });

    const [{ total }] = await db
      .select({ total: count() })
      .from(targetTransactionTable)
      .where(and(...filters))
      .innerJoin(
        targetCategoryTable,
        eq(targetCategoryTable.id, targetTransactionTable.categoryId)
      );

    return {
      transactions,
      total,
    };
  };
}
