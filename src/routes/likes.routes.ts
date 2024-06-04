import { Router } from "express";
import { likePostController } from "~/controllers/likes.controller";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const likesRouter = Router();
likesRouter.post("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(likePostController));

export default likesRouter;
