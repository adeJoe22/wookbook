import { NextFunction, Response } from 'express';
import createHttpError from 'http-errors';

import { environmentConfig } from '@src/configs/custom-environment-variables.config';
import { IAuthRequest as IAdminRequest } from '@src/interfaces';
import { authorizationRoles } from '@src/constants';

export const isAdmin = async (req: IAdminRequest, res: Response, next: NextFunction) => {
  const user = req?.user;

  const adminUser =
    user && user.role === authorizationRoles.admin && environmentConfig?.ADMIN_EMAILS?.includes(`${user?.email}`);

  if (!adminUser) {
    return next(createHttpError(403, `Auth Failed (Unauthorized)`));
  }

  next();
};

export default { isAdmin };
