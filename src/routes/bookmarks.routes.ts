import { Router } from "express";
import { createBookmarkController, removeBookmarkController } from "~/controllers/bookmarks.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const bookmarkRouter = Router();

bookmarkRouter.post("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(createBookmarkController));
bookmarkRouter.delete(
  "/tweets/:tweet_id",
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(removeBookmarkController),
);

export default bookmarkRouter;
