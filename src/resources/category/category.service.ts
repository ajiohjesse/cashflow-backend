import { db } from '@/database';
import {
  inflowCategoryTable,
  inflowTable,
  outflowCategoryTable,
  outflowTable,
} from '@/database/schemas';
import { APIErrors, PublicError } from '@/libraries/error.lib';
import { and, asc, count, eq, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import type {
  CategoryWithStatDTO,
  SelectCategoryDTO,
} from './category.validators';

interface IGetCategories {
  userId: string;
  type: 'inflow' | 'outflow';
}

interface ICreateCategory {
  categoryName: string;
  userId: string;
  type: 'inflow' | 'outflow';
}

interface IDeleteCategory {
  categoryId: string;
  userId: string;
  type: 'inflow' | 'outflow';
}

export class CategoryService {
  getCategories = async ({
    userId,
    type,
  }: IGetCategories): Promise<SelectCategoryDTO[]> => {
    const targetTable =
      type === 'inflow' ? inflowCategoryTable : outflowCategoryTable;

    const categories = await db
      .select()
      .from(targetTable)
      .where(eq(targetTable.userId, userId))
      .orderBy(asc(targetTable.name));

    return categories;
  };

  getCategoriesWithStat = async ({
    userId,
    type,
  }: IGetCategories): Promise<CategoryWithStatDTO[]> => {
    if (type === 'inflow') {
      return db
        .select({
          id: inflowCategoryTable.id,
          name: inflowCategoryTable.name,
          totalTransactions: count(inflowTable.id),
        })
        .from(inflowCategoryTable)
        .where(eq(inflowCategoryTable.userId, userId))
        .leftJoin(
          inflowTable,
          eq(inflowTable.categoryId, inflowCategoryTable.id)
        )
        .groupBy(inflowCategoryTable.name, inflowCategoryTable.id)
        .orderBy(asc(inflowCategoryTable.name));
    }

    return db
      .select({
        id: outflowCategoryTable.id,
        name: outflowCategoryTable.name,
        totalTransactions: count(outflowTable.id),
      })
      .from(outflowCategoryTable)
      .where(eq(outflowCategoryTable.userId, userId))
      .leftJoin(
        outflowTable,
        eq(outflowTable.categoryId, outflowCategoryTable.id)
      )
      .groupBy(outflowCategoryTable.name, outflowCategoryTable.id)
      .orderBy(asc(outflowCategoryTable.name));
  };

  createCategory = async ({
    categoryName,
    type,
    userId,
  }: ICreateCategory): Promise<SelectCategoryDTO> => {
    const targetTable =
      type === 'inflow' ? inflowCategoryTable : outflowCategoryTable;

    const filters = [
      eq(sql`lower(${targetTable.name})`, categoryName.toLowerCase().trim()),
      eq(targetTable.userId, userId),
    ];

    const [existingCategory] = await db
      .select()
      .from(targetTable)
      .where(and(...filters));

    if (existingCategory) {
      throw new PublicError(
        StatusCodes.CONFLICT,
        'Category with this name already exists',
        {
          categoryName,
        }
      );
    }

    const [createdCategory] = await db
      .insert(targetTable)
      .values({
        name: categoryName.trim(),
        userId,
      })
      .returning();

    return createdCategory;
  };

  deleteCategory = async ({ categoryId, type, userId }: IDeleteCategory) => {
    const targetCategoryTable =
      type === 'inflow' ? inflowCategoryTable : outflowCategoryTable;
    const targetTransactionTable =
      type === 'inflow' ? inflowTable : outflowTable;

    const [category] = await db
      .select({
        id: targetCategoryTable.id,
        totalTransactions: count(targetTransactionTable.id),
      })
      .from(targetCategoryTable)
      .where(
        and(
          eq(targetCategoryTable.userId, userId),
          eq(targetCategoryTable.id, categoryId)
        )
      )
      .leftJoin(
        targetTransactionTable,
        eq(targetTransactionTable.categoryId, targetCategoryTable.id)
      )
      .groupBy(targetCategoryTable.id);

    if (!category) {
      throw APIErrors.notFoundError();
    }

    if (category.totalTransactions > 0) {
      throw new PublicError(
        StatusCodes.FORBIDDEN,
        'Cannot delete a category that has attached transactions.'
      );
    }

    await db
      .delete(targetCategoryTable)
      .where(
        and(
          eq(targetCategoryTable.id, categoryId),
          eq(targetCategoryTable.userId, userId)
        )
      );

    return;
  };
}
