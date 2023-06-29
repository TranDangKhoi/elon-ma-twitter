import { Router } from "express";
import {
  signInController as signInController,
  signOutController,
  signUpController,
} from "~/controllers/users.controllers";
import {
  loginValidator as signInValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
} from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const usersRouter = Router();

usersRouter.post("/signin", signInValidator, wrapRequestHandler(signInController));
usersRouter.post("/signup", registerValidator, wrapRequestHandler(signUpController));
usersRouter.post("/signout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(signOutController));

export default usersRouter;
