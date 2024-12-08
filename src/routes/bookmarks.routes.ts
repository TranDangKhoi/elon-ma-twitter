import { Router } from "express";
import {
  checkBookmarkController,
  createBookmarkController,
  getBookmarksController,
  removeBookmarkController,
} from "~/controllers/bookmarks.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const bookmarkRouter = Router();

bookmarkRouter.get("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getBookmarksController));
bookmarkRouter.get(
  "/tweets/:tweet_id",
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(checkBookmarkController),
);
bookmarkRouter.post("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(createBookmarkController));
bookmarkRouter.delete(
  "/tweets/:tweet_id",
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(removeBookmarkController),
);

export default bookmarkRouter;
