import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import type { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
extendZodWithOpenApi(z);

export const generateApiResponseSchema = ({
  dataSchema,
  statusCode,
  success,
  message,
}: {
  dataSchema: z.Schema;
  statusCode?: StatusCodes;
  success?: boolean;
  message?: string;
}) => {
  return z.object({
    statusCode: z.number().openapi({ example: statusCode }),
    success: z.boolean().openapi({ example: success }),
    message: z.string().openapi({ example: message }),
    data: dataSchema,
  });
};

type APIResponseData = z.infer<ReturnType<typeof generateApiResponseSchema>>;

export class ResponseData {
  static success<TData extends Record<string, unknown>>(
    statusCode: StatusCodes,
    message: string,
    data?: TData
  ): APIResponseData {
    return {
      success: true,
      statusCode: statusCode,
      message,
      data: data ?? {},
    };
  }

  static error<TData extends Record<string, unknown>>(
    statusCode: StatusCodes,
    message: string,
    data?: TData
  ): APIResponseData {
    return {
      success: false,
      statusCode: statusCode,
      message,
      data: data ?? {},
    };
  }

  static successWithPagination<
    ItemList extends string,
    TData extends Record<string, unknown>,
  >(
    statusCode: StatusCodes,
    message: string,
    data: {
      items: {
        [key in ItemList]: TData[];
      };
      pagination: {
        totalCount: number;
        currentPage: number;
        limit: number;
      };
    }
  ): APIResponseData {
    return {
      success: true,
      statusCode: statusCode,
      message,
      data: {
        ...data.items,
        pagination: data.pagination,
      },
    };
  }
}
