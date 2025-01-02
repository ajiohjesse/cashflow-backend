import { ResponseData } from '@/libraries/response.lib';
import express from 'express';

const route = express.Router();
export { route as healthRoute };

route.get('/health-check', (_, res) => {
  res.status(200).json(ResponseData.success(200, 'Server is running'));
});
