import { Router } from "express";
import {
  createTweetController,
  getNewFeedController,
  getTweetChildrenController,
  getTweetController,
} from "~/controllers/tweets.controllers";
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  tweetIdValidator,
} from "~/middlewares/tweets.middleware";
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const tweetsRouter = Router();

tweetsRouter.get("/new-feed", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getNewFeedController));

tweetsRouter.get(
  "/:tweet_id",
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController),
);

// Endpoint này sẽ lấy ra toàn bộ tweet con của tweet cha, và chúng ta sẽ sử dụng phân trang để cải thiện respone time cho api
// params: {limit: number, page: number, tweet_type: TweetTypeEnum}
tweetsRouter.get(
  "/:tweet_id/children",
  tweetIdValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController),
);

tweetsRouter.post(
  "/",
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  createTweetValidator,
  wrapRequestHandler(createTweetController),
);

export default tweetsRouter;
