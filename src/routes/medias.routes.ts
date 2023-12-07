import { Router } from "express";
import { uploadSingleImage } from "~/controllers/medias.controllers";
import { wrapRequestHandler } from "~/utils/handlers";

const mediasRouter = Router();

mediasRouter.post("/upload-image", wrapRequestHandler(uploadSingleImage));

export default mediasRouter;
