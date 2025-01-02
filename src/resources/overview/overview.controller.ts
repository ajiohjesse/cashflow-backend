import { APIErrors } from '@/libraries/error.lib';
import { ResponseData } from '@/libraries/response.lib';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import type { OverviewService } from './overview.service';
import type { OverviewDTO } from './overview.validators';

export class OverviewController {
  constructor(private service: OverviewService) {
    this.service = service;
  }

  getOverview: RequestHandler = async (req, res) => {
    if (!res.locals.user) {
      throw APIErrors.authenticationError();
    }
    const userId = res.locals.user.userId;
    const overview = await this.service.getOverview({ userId });

    res
      .status(StatusCodes.OK)
      .json(
        ResponseData.success<OverviewDTO>(
          StatusCodes.OK,
          'Overview retrieved successfully',
          overview
        )
      );
  };
}
