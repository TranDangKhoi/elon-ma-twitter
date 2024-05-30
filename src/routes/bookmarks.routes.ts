import { Router } from "express";
import { createBookmarkController } from "~/controllers/bookmarks.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const bookmarkRouter = Router();

bookmarkRouter.post("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(createBookmarkController));

export default bookmarkRouter;
