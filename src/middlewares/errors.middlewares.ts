import { NextFunction, Request, Response } from "express";
import { omit } from "lodash";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { ErrorWithStatus } from "~/models/Errors";

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status || HttpStatusCode.INTERNAL_SERVER).json(omit(err, ["status"]));
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true });
  });
  return res.status(HttpStatusCode.INTERNAL_SERVER).json(err);
};
