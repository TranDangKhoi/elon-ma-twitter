import { Router } from "express";
import { likePostController } from "~/controllers/likes.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const likesRouter = Router();
// TODO: Implement routes for unliking post, getting liked posts of a user, getting likes of a post (pagination)

likesRouter.post("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(likePostController));

export default likesRouter;
