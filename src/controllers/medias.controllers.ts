import { NextFunction, Request, Response } from "express";
import path from "node:path";
import { UPLOAD_DIR } from "~/constants/constants";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import mediasServices from "~/services/medias.services";

export const uploadSingleImage = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasServices.handleUploadImages(req);
  res.status(HttpStatusCode.OK).json({
    result,
  });
};

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params;
  res.sendFile(path.resolve(UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send("Not found");
    }
  });
};
