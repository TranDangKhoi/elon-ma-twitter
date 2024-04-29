import { Router } from "express";
import { createTweetController } from "~/controllers/tweets.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const tweetsRouter = Router();

tweetsRouter.post("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(createTweetController));

export default tweetsRouter;
