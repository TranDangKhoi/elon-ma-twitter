import { Router } from "express";
import {
  emailVerifyController,
  signInController as signInController,
  signOutController,
  signUpController,
} from "~/controllers/users.controllers";
import {
  loginValidator as signInValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyTokenValidator,
} from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const usersRouter = Router();

usersRouter.post("/signin", signInValidator, wrapRequestHandler(signInController));
usersRouter.post("/signup", registerValidator, wrapRequestHandler(signUpController));
usersRouter.post("/signout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(signOutController));
usersRouter.post("/refresh-token");
usersRouter.post("/verify-email", emailVerifyTokenValidator, wrapRequestHandler(emailVerifyController));
export default usersRouter;
