import {validationResult} from 'express-validator';
import {Request, Response, NextFunction} from 'express';

import {RequestValidationError} from '../errors';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }

  next();
}
