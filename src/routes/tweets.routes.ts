import { Router } from "express";
import { createTweetController } from "~/controllers/tweets.controllers";
import { createTweetValidator } from "~/middlewares/tweets.middleware";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const tweetsRouter = Router();

tweetsRouter.post(
  "/",
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController),
);

export default tweetsRouter;
