import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import mediasServices from "~/services/medias.services";

export const uploadSingleImage = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasServices.handleUploadSingleImage(req);
  res.status(HttpStatusCode.OK).json({
    result,
  });
};
