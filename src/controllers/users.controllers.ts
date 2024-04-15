import { config } from "dotenv";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enums";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { FollowMessage, UserMessage } from "~/constants/messages.enum";
import {
  TChangePasswordReqBody,
  TFollowUserReqBody,
  TLoginReqBody,
  TProfileReqParams,
  TSignOutReqBody,
  TSignUpReqBody,
  TUnfollowedReqParams,
  TUpdateReqBody,
  TokenPayload,
} from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";
config();
// Validation chain - Sử dụng cho bản express-validator 6 cho xuống
// export const testController = (req: Request, res: Response) => {
//   const errors = validationResult(req);
//   if (errors.isEmpty()) {
//     return res.status(200).send(`Hello, ${req.query.name}`);
//   }
//   return res.status(400).send({ errors: errors.array() });
// };

export const signInController = async (req: Request<ParamsDictionary, any, TLoginReqBody>, res: Response) => {
  const { user } = req;
  const userId = user?._id as ObjectId;
  const result = await usersServices.signIn({ user_id: userId.toString(), verify: user?.verify as UserVerifyStatus });
  res.status(HttpStatusCode.CREATED).json({
    message: "Đăng nhập thành công",
    result,
  });
};

export const oAuth2Controller = async (req: Request, res: Response) => {
  const { code } = req.query;
  const result = await usersServices.signInUsingOAuth2(code as string);
  const urlRedirect = `${process.env.GOOGLE_OAUTH_CLIENT_REDIRECT_URI}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.new_user}&verify=${result.verify}`;
  res.redirect(urlRedirect);
};

export const signUpController = async (req: Request<ParamsDictionary, any, TSignUpReqBody>, res: Response) => {
  const result = await usersServices.signUp(req.body);
  res.status(HttpStatusCode.CREATED).json({
    message: "Đăng ký thành công",
    result,
  });
};

export const signOutController = async (req: Request<ParamsDictionary, any, TSignOutReqBody>, res: Response) => {
  const { refresh_token } = req.body;
  const result = await usersServices.signOut(refresh_token);
  res.status(HttpStatusCode.CREATED).json(result);
};

export const refreshTokenController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { refresh_token } = req.body;
  const { user_id, verify, exp } = req.decoded_refresh_token as TokenPayload;
  const result = await usersServices.refreshToken({ refresh_token, user_id, verify, exp });
  res.status(HttpStatusCode.OK).json({
    message: UserMessage.REFRESH_TOKEN_SUCCESSFULLY,
    result,
  });
};

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, { email_verify_token: string }>,
  res: Response,
) => {
  // const { email_verify_token } = req.body;
  const { user_id } = req.decoded_email_verify_token as TokenPayload;
  // Id của user trong MongoDB sẽ được indexed, nên để tối ưu nhất thì nên find theo ID (sẽ giải thích thêm sau)
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  // Nếu không tìm thấy user dựa theo id
  if (!user) {
    return res.status(HttpStatusCode.NOT_FOUND).json({
      message: UserMessage.EMAIL_VERIFY_TOKEN_INVALID,
    });
  }
  // Nếu đã verify rồi (tức là email_verify_token === "")
  // Trả về status OK với message là đã verified trước đó rồi
  if (user.email_verify_token === "") {
    return res.status(HttpStatusCode.OK).json({
      message: UserMessage.EMAIL_VERIFY_TOKEN_IS_VERIFIED,
    });
  }
  const result = await usersServices.verifyEmail(user_id);
  return res.status(HttpStatusCode.OK).json({
    message: "Xác thực email thành công",
    result,
  });
};

export const resendVerifyEmailController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  if (!user) {
    return res.status(HttpStatusCode.NOT_FOUND).json({
      message: UserMessage.USER_NOT_FOUND,
    });
  }
  if (user.verify === UserVerifyStatus.VERIFIED) {
    return res.status(HttpStatusCode.OK).json({
      message: UserMessage.EMAIL_VERIFY_TOKEN_IS_VERIFIED,
    });
  }
  const result = await usersServices.resendVerifyEmail(user_id);
  return res.status(HttpStatusCode.OK).json({
    message: "Gửi lại email xác thực thành công",
    result,
  });
};

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, { email: string }>,
  res: Response,
) => {
  const { _id, verify } = req.user as User;
  const result = await usersServices.forgotPassword({ user_id: _id.toString(), verify });
  return res.status(HttpStatusCode.OK).json({
    result,
  });
};

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, { forgot_password_token: string }>,
  res: Response,
) => {
  const result = await usersServices.verifyForgotPasswordToken(req.body.forgot_password_token);
  res.status(HttpStatusCode.OK).json({
    result,
  });
};

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, { password: string; confirm_password: string }>,
  res: Response,
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload;
  const result = await usersServices.resetPassword(user_id, req.body.password);
  res.status(HttpStatusCode.OK).json({
    message: "Đặt lại mật khẩu thành công",
    result,
  });
};

export const getMeController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const user = await usersServices.getMe(user_id);
  res.status(HttpStatusCode.OK).json({
    message: UserMessage.USER_FOUND,
    result: user,
  });
};

export const updateMeController = async (req: Request<ParamsDictionary, any, TUpdateReqBody>, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const body = req.body;
  const user = await usersServices.updateMe(user_id, body);
  return res.status(HttpStatusCode.OK).json({
    message: "Updated profile successfully",
    result: user,
  });
};

export const changePassswordController = async (
  req: Request<ParamsDictionary, any, TChangePasswordReqBody>,
  res: Response,
) => {
  const { confirm_new_password } = req.body;
  const { user_id } = req.decoded_access_token as TokenPayload;
  await usersServices.changePassword(user_id, confirm_new_password);
  res.status(HttpStatusCode.OK).json({
    message: UserMessage.CHANGE_PASSWORD_SUCCESSFULLY,
  });
};

export const getProfileController = async (req: Request<TProfileReqParams, any, any>, res: Response) => {
  const { username } = req.params;
  const result = await usersServices.getProfile(username);
  res.status(HttpStatusCode.OK).json(result);
};

export const followUserController = async (req: Request<ParamsDictionary, any, TFollowUserReqBody>, res: Response) => {
  const { user_id: current_user_id } = req.decoded_access_token as TokenPayload;
  const { being_followed_user_id } = req.body;
  const result = await usersServices.followUser(current_user_id, being_followed_user_id);
  res.status(HttpStatusCode.OK).json({
    message: FollowMessage.FOLLOW_SUCCESSFULLY,
    result,
  });
};

export const unfollowUserController = async (req: Request<TUnfollowedReqParams>, res: Response) => {
  const { user_id: current_user_id } = req.decoded_access_token as TokenPayload;
  const { being_followed_user_id } = req.params;
  const result = await usersServices.unfollowUser(current_user_id, being_followed_user_id);
  res.status(HttpStatusCode.OK).json({
    message: FollowMessage.UNFOLLOW_SUCCESSFULLY,
    result,
  });
};
