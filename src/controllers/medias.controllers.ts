import { NextFunction, Request, Response } from "express";
import path from "node:path";
import { IMAGE_UPLOAD_DIR } from "~/constants/constants";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { MediaMessage } from "~/constants/messages.enum";
import mediasServices from "~/services/medias.services";

export const uploadImagesController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasServices.handleUploadImages(req);
  res.status(HttpStatusCode.OK).json({
    message: MediaMessage.UPLOAD_IMAGE_SUCCESSFULLY,
    result,
  });
};

export const uploadVideosController = async (req: Request, res: Response, next: NextFunction) => {
  res.status(HttpStatusCode.OK).json({
    message: MediaMessage.UPLOAD_VIDEO_SUCCESSFULLY,
  });
};

export const serveImageController = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params;
  res.sendFile(path.resolve(IMAGE_UPLOAD_DIR, name), (err) => {
    if (err) {
      res.status((err as any).status).send("Not found");
    }
  });
};
