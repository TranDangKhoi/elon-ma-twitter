import { Router } from "express";
import {
  serveImageController,
  streamVideoController,
  uploadImagesController as uploadImagesController,
  uploadVideosController,
} from "~/controllers/medias.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const mediasRouter = Router();

mediasRouter.get("/image/:name", wrapRequestHandler(serveImageController));
mediasRouter.get("/video-stream/:name", wrapRequestHandler(streamVideoController));
mediasRouter.post(
  "/upload-image",
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImagesController),
);
mediasRouter.post(
  "/upload-video",
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideosController),
);
export default mediasRouter;
