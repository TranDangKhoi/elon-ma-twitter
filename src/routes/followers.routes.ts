import { Router } from "express";
import {
  followUserController,
  getFollowersController,
  unfollowUserController,
} from "~/controllers/followers.controllers";
import { followUserValidator, unfollowUserValidator } from "~/middlewares/followers.middlewares";
import { searchParamsValidator } from "~/middlewares/search.middlewares";
import { accessTokenValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const followersRouter = Router();

// Get my followers (can only get verfied account followers)
followersRouter.get("/me", accessTokenValidator, searchParamsValidator, wrapRequestHandler(getFollowersController));

// PENDING: Get followers of a user (can only get verfied account followers)
followersRouter.get("/:username", accessTokenValidator);

// PENDING: Get my following (can only get verfied account followers)
followersRouter.get("/me/following", accessTokenValidator);

// PENDING: Get following of a user (can only get verfied account followers)
followersRouter.get("/:username/following", accessTokenValidator);

followersRouter.post("/", accessTokenValidator, followUserValidator, wrapRequestHandler(followUserController));

followersRouter.delete(
  "/:being_followed_user_id",
  accessTokenValidator,
  unfollowUserValidator,
  wrapRequestHandler(unfollowUserController),
);

export default followersRouter;
