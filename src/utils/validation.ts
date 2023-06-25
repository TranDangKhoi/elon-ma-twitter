import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { RunnableValidationChains } from "express-validator/src/middlewares/schema";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { ErrorWithStatus } from "~/models/Errors";
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req);
    const errors = validationResult(req);
    const errorsObject = errors.mapped();
    for (const key in errorsObject) {
      const { msg } = errorsObject[key];
      if (msg instanceof ErrorWithStatus && msg.status !== HttpStatusCode.UNPROCESSABLE_ENTITY) {
        return next(msg); // pass to error handle
      }
    }
    if (errors.isEmpty()) {
      return next();
    }

    res.status(422).json({ errors: errorsObject });
  };
};
