import { Router } from "express";
import { uploadSingleImage } from "~/controllers/medias.controllers";

const mediasRouter = Router();

mediasRouter.post("/upload-image", uploadSingleImage);

export default mediasRouter;
