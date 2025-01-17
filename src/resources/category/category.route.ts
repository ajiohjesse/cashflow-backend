import { authHandler } from '@/middleware/auth.middleware';
import { Router } from 'express';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

const route = Router();
export { route as categoryRoute };

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService);

route.get(
  '/v1/categories/inflow',
  authHandler,
  categoryController.getInflowCategories
);

route.get(
  '/v1/categories/outflow',
  authHandler,
  categoryController.getOutflowCategories
);

route.get(
  '/v1/categories/inflow/stats',
  authHandler,
  categoryController.getInflowCategoriesWithStat
);

route.get(
  '/v1/categories/outflow/stats',
  authHandler,
  categoryController.getOutflowCategoriesWithStat
);

route.post(
  '/v1/categories/inflow',
  authHandler,
  categoryController.createInflowCategory
);

route.post(
  '/v1/categories/outflow',
  authHandler,
  categoryController.createOutflowCategory
);

route.delete(
  '/v1/categories/inflow/:id',
  authHandler,
  categoryController.deleteInflowCategory
);

route.delete(
  '/v1/categories/outflow/:id',
  authHandler,
  categoryController.deleteOutflowCategory
);
