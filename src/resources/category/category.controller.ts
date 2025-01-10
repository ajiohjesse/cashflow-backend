import { APIErrors } from '@/libraries/error.lib';
import { RequestValidator } from '@/libraries/request.lib';
import { ResponseData } from '@/libraries/response.lib';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { CategoryService } from './category.service';
import {
  categoryParamsSchema,
  insertCategorySchema,
  type SelectCategoryDTO,
} from './category.validators';

export class CategoryController {
  constructor(private service: CategoryService) {
    this.service = service;
  }

  getInflowCategories: RequestHandler = async (_req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }
    const userId = res.locals.user.userId;
    const categories = await this.service.getCategories({
      userId,
      type: 'inflow',
    });

    res.status(StatusCodes.OK).json(
      ResponseData.successWithPagination<'inflowCategories', SelectCategoryDTO>(
        StatusCodes.OK,
        'Inflow categories retrieved successfully',
        {
          items: {
            inflowCategories: categories,
          },
          pagination: {
            currentPage: 1,
            limit: categories.length,
            totalCount: categories.length,
          },
        }
      )
    );
  };

  getOutflowCategories: RequestHandler = async (_req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }
    const userId = res.locals.user.userId;
    const categories = await this.service.getCategories({
      userId,
      type: 'outflow',
    });

    res.status(StatusCodes.OK).json(
      ResponseData.successWithPagination<
        'outflowCategories',
        SelectCategoryDTO
      >(StatusCodes.OK, 'Outflow categories retrieved successfully', {
        items: {
          outflowCategories: categories,
        },
        pagination: {
          currentPage: 1,
          limit: categories.length,
          totalCount: categories.length,
        },
      })
    );
  };

  createInflowCategory: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }
    const userId = res.locals.user.userId;
    const category = RequestValidator.validateBody(
      req.body,
      insertCategorySchema
    );

    const createdCategory = await this.service.createCategory({
      userId,
      type: 'inflow',
      categoryName: category.name,
    });

    res
      .status(StatusCodes.CREATED)
      .json(
        ResponseData.success<SelectCategoryDTO>(
          StatusCodes.CREATED,
          'Inflow category created successfully',
          createdCategory
        )
      );
  };

  createOutflowCategory: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }
    const userId = res.locals.user.userId;
    const category = RequestValidator.validateBody(
      req.body,
      insertCategorySchema
    );

    const createdCategory = await this.service.createCategory({
      userId,
      type: 'outflow',
      categoryName: category.name,
    });

    res
      .status(StatusCodes.CREATED)
      .json(
        ResponseData.success<SelectCategoryDTO>(
          StatusCodes.CREATED,
          'Outflow category created successfully',
          createdCategory
        )
      );
  };

  deleteInflowCategory: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }

    const { id } = RequestValidator.validateParams(
      req.params,
      categoryParamsSchema
    );

    await this.service.deleteCategory({
      categoryId: id,
      type: 'inflow',
      userId: res.locals.user.userId,
    });

    res
      .status(StatusCodes.NO_CONTENT)
      .json(
        ResponseData.success(
          StatusCodes.NO_CONTENT,
          'Inflow category deleted successfully'
        )
      );
  };

  deleteOutflowCategory: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }

    const { id } = RequestValidator.validateParams(
      req.params,
      categoryParamsSchema
    );

    await this.service.deleteCategory({
      categoryId: id,
      type: 'outflow',
      userId: res.locals.user.userId,
    });

    res
      .status(StatusCodes.NO_CONTENT)
      .json(
        ResponseData.success(
          StatusCodes.NO_CONTENT,
          'Outflow category deleted successfully'
        )
      );
  };
}
