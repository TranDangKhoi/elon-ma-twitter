import { Router } from "express";
import { createTweetController, getTweetController } from "~/controllers/tweets.controllers";
import { createTweetValidator, tweetIdValidator } from "~/middlewares/tweets.middleware";
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const tweetsRouter = Router();

tweetsRouter.get("/:tweet_id", tweetIdValidator, wrapRequestHandler(getTweetController));

tweetsRouter.post(
  "/",
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  createTweetValidator,
  wrapRequestHandler(createTweetController),
);

export default tweetsRouter;
