import { Router } from "express";
import { serveImageController, uploadSingleImage as uploadImages } from "~/controllers/medias.controllers";
import { wrapRequestHandler } from "~/utils/handlers";

const mediasRouter = Router();

mediasRouter.get("/image/:name", wrapRequestHandler(serveImageController));
mediasRouter.post("/upload-image", wrapRequestHandler(uploadImages));
export default mediasRouter;
