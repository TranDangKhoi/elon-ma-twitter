import { NextFunction, Response, Request } from "express";

export const wrapRequestHandler = <T>(func: (req: Request, res: Response, next: NextFunction) => Promise<T>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
