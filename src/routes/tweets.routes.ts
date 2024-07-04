import { Router } from "express";
import { createTweetController, getTweetController } from "~/controllers/tweets.controllers";
import { audienceValidator, createTweetValidator, tweetIdValidator } from "~/middlewares/tweets.middleware";
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const tweetsRouter = Router();

tweetsRouter.get(
  "/:tweet_id",
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController),
);
tweetsRouter.get("/comments");

tweetsRouter.post(
  "/",
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  createTweetValidator,
  wrapRequestHandler(createTweetController),
);

export default tweetsRouter;
