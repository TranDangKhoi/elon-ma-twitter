import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { RunnableValidationChains } from "express-validator/src/middlewares/schema";
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validations.run(req);
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.mapped() });
  };
};
