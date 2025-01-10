import { db } from '@/database';
import {
  inflowCategoryTable,
  inflowTable,
  outflowCategoryTable,
  outflowTable,
} from '@/database/schemas';
import { PublicError } from '@/libraries/error.lib';
import { eq } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import type {
  InsertTransactionDTO,
  SelectTransactionDTO,
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
}
