import { NextFunction, Request, Response } from "express";
import { omit } from "lodash";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";

export const defaultErrorHandler = (
  err: { status: number; message: string[] },
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(err.status || HttpStatusCode.INTERNAL_SERVER).json(omit(err, ["status"]));
};
