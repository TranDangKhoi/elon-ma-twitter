import { Router } from "express";
import {
  verifyEmailController,
  resendVerifyEmailController,
  signInController as signInController,
  signOutController,
  signUpController,
  forgotPasswordController,
  verifyForgotPasswordController,
  resetPasswordController,
  getMeController,
  updateMeController,
  getProfileController,
  changePassswordController,
  oAuth2Controller,
  refreshTokenController,
} from "~/controllers/users.controllers";
import { filterMiddleware } from "~/middlewares/common.middlewares";
import {
  signInValidator,
  registerValidator,
  accessTokenValidator,
  refreshTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  verifyForgotPasswordTokenValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  updateMeValidator,
  changePasswordValidator,
} from "~/middlewares/users.middlewares";
import { TUpdateReqBody } from "~/models/requests/User.requests";
import { wrapRequestHandler } from "~/utils/requestHandlers";

const usersRouter = Router();

usersRouter.post("/signin", signInValidator, wrapRequestHandler(signInController));
usersRouter.get("/oauth/google", wrapRequestHandler(oAuth2Controller));
usersRouter.post("/signup", registerValidator, wrapRequestHandler(signUpController));
usersRouter.post("/signout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(signOutController));
usersRouter.post("/refresh-token", refreshTokenValidator, wrapRequestHandler(refreshTokenController));
usersRouter.post("/verify-email", emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController));
usersRouter.post("/resend-verify-email", accessTokenValidator, wrapRequestHandler(resendVerifyEmailController));
usersRouter.post("/forgot-password", forgotPasswordValidator, wrapRequestHandler(forgotPasswordController));
usersRouter.post(
  "/verify-forgot-password",
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController),
);
usersRouter.post("/reset-password", resetPasswordValidator, wrapRequestHandler(resetPasswordController));
usersRouter.get("/me", accessTokenValidator, wrapRequestHandler(getMeController));
usersRouter.patch(
  "/me",
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<TUpdateReqBody>([
    "avatar",
    "bio",
    "cover_photo",
    "date_of_birth",
    "location",
    "name",
    "website",
    "username",
  ]),
  wrapRequestHandler(updateMeController),
);
usersRouter.put(
  "/change-password",
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePassswordController),
);
usersRouter.get("/:username", wrapRequestHandler(getProfileController));
export default usersRouter;
