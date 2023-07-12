import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ObjectId } from "mongodb";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { ValidationMessage } from "~/constants/messages.enum";
import { TSignOutReqBody, TSignUpReqBody, TokenPayload } from "~/models/requests/User.requests";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";

// Validation chain - Sử dụng cho bản express-validator 6 cho xuống
// export const testController = (req: Request, res: Response) => {
//   const errors = validationResult(req);
//   if (errors.isEmpty()) {
//     return res.status(200).send(`Hello, ${req.query.name}`);
//   }
//   return res.status(400).send({ errors: errors.array() });
// };

export const signInController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user } = req;
  const userId = user?._id as ObjectId;
  const result = await usersServices.signIn(userId.toString());
  res.status(HttpStatusCode.CREATED).json({
    message: "Đăng nhập thành công",
    result,
  });
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
  const { decoded_refresh_token } = req;
  const result = await usersServices.signOut(refresh_token);
  res.status(HttpStatusCode.CREATED).json(result);
};

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, { email_verify_token: string }>,
  res: Response,
) => {
  const { email_verify_token } = req.body;
  const { user_id } = req.decoded_email_verify_token as TokenPayload;
  // Id của user trong MongoDB sẽ được indexed, nên để tối ưu nhất thì nên find theo ID (sẽ giải thích thêm sau)
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });
  // Nếu không tìm thấy user dựa theo id
  if (!user) {
    return res.status(HttpStatusCode.NOT_FOUND).json({
      message: ValidationMessage.EMAIL_VERIFY_TOKEN_INVALID,
    });
  }
  // Nếu đã verify rồi (tức là email_verify_token === "")
  // Trả về status OK với message là đã verified trước đó rồi
  if (user.email_verify_token === "") {
    return res.status(HttpStatusCode.OK).json({
      message: ValidationMessage.EMAIL_VERIFY_TOKEN_IS_VERIFIED,
    });
  }
  const result = await usersServices.verifyEmail(user_id);
  return res.status(HttpStatusCode.OK).json({
    message: "Xác thực email thành công",
    result,
  });
};
