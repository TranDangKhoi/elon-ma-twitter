import { Router } from "express";
import {
  serveImageController,
  streamVideoController,
  uploadHlsVideoController,
  uploadImagesController as uploadImagesController,
  uploadVideosController,
} from "~/controllers/medias.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/requestHandlers";

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
mediasRouter.post(
  "/upload-video-hls",
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadHlsVideoController),
);
export default mediasRouter;
