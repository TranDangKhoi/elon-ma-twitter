import { Router } from "express";
import { getConversationController } from "~/controllers/conversations.controllers";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const conversationRouter = Router();

conversationRouter.get("/", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(getConversationController));

export default conversationRouter;
