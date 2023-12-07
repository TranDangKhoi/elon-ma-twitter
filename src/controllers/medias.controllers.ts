import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { formiddableSingleUploadHandler } from "~/utils/file";

export const uploadSingleImage = async (req: Request, res: Response, next: NextFunction) => {
  const data = await formiddableSingleUploadHandler(req);
  res.status(HttpStatusCode.OK).json({
    result: data,
  });
};
