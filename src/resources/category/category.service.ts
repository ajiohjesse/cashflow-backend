import { db } from '@/database';
import { inflowCategoryTable, outflowCategoryTable } from '@/database/schemas';
import { APIErrors, PublicError } from '@/libraries/error.lib';
import { and, asc, eq, sql } from 'drizzle-orm';
import { StatusCodes } from 'http-status-codes';
import type { SelectCategoryDTO } from './category.validators';

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

  createCategory = async ({
    categoryName,
    type,
    userId,
  }: ICreateCategory): Promise<SelectCategoryDTO> => {
    const targetTable =
      type === 'inflow' ? inflowCategoryTable : outflowCategoryTable;

    const [existingCategory] = await db
      .select()
      .from(targetTable)
      .where(
        and(
          eq(
            sql`lower(trim(${targetTable.name}))`,
            categoryName.toLowerCase().trim()
          ),
          eq(targetTable.userId, userId)
        )
      );

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

  deleteCategory = async ({
    categoryId,
    type,
    userId,
  }: IDeleteCategory): Promise<SelectCategoryDTO> => {
    const targetTable =
      type === 'inflow' ? inflowCategoryTable : outflowCategoryTable;

    const [deletedCategory] = await db
      .delete(targetTable)
      .where(
        and(eq(targetTable.id, categoryId), eq(targetTable.userId, userId))
      )
      .returning();

    if (!deletedCategory) {
      throw APIErrors.notFoundError();
    }

    return deletedCategory;
  };
}
