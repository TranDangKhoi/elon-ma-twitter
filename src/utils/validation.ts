import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { RunnableValidationChains } from "express-validator/src/middlewares/schema";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { ErrorWithStatus, UnprocessableEntityError } from "~/models/Errors";
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorsObject = errors.mapped();
    const unprocessableEntityError = new UnprocessableEntityError({ errors: {} });
    for (const key in errorsObject) {
      const { msg } = errorsObject[key];
      if (msg instanceof ErrorWithStatus && msg.status !== HttpStatusCode.UNPROCESSABLE_ENTITY) {
        return next(msg); // pass to default error handle
      }
      unprocessableEntityError.errors[key] = errorsObject[key];
    }
    next(unprocessableEntityError);
  };
};
