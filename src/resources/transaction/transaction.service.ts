import { db } from '@/database';
import { inflowTable, outflowTable } from '@/database/schemas';
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
    const targetTable = type === 'inflow' ? inflowTable : outflowTable;

    const [createdTransaction] = await db
      .insert(targetTable)
      .values({
        userId,
        ...transaction,
      })
      .returning();

    return createdTransaction;
  };
}
