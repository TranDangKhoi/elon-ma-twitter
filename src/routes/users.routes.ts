import { Router } from "express";
import {
  verifyEmailController,
  resendVerifyEmailController,
  signInController as signInController,
  signOutController,
  signUpController,
  forgotPasswordController,
} from "~/controllers/users.controllers";
import {
  loginValidator as signInValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
} from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const usersRouter = Router();

usersRouter.post("/signin", signInValidator, wrapRequestHandler(signInController));
usersRouter.post("/signup", registerValidator, wrapRequestHandler(signUpController));
usersRouter.post("/signout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(signOutController));
usersRouter.post("/refresh-token");
usersRouter.post("/verify-email", emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController));
usersRouter.post("/resend-verify-email", accessTokenValidator, wrapRequestHandler(resendVerifyEmailController));
usersRouter.post("/forgot-password", forgotPasswordValidator, wrapRequestHandler(forgotPasswordController));
export default usersRouter;
