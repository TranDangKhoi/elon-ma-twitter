import pick from "lodash/pick";
import { NextFunction, Request, Response } from "express";

type FilterKeys<T> = Array<keyof T>;

export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys);
    next();
  };
