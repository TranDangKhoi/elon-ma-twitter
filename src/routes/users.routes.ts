import { Router } from "express";
import {
  verifyEmailController,
  resendVerifyEmailController,
  signInController as signInController,
  signOutController,
  signUpController,
  forgotPasswordController,
  verifyForgotPasswordController,
} from "~/controllers/users.controllers";
import {
  loginValidator as signInValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  verifyForgotPasswordTokenValidator,
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
usersRouter.post(
  "/verify-forgot-password",
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController),
);
export default usersRouter;
