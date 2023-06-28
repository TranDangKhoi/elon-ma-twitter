import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ObjectId } from "mongodb";
import { TSignUpReqBody } from "~/models/requests/User.requests";
import usersServices from "~/services/users.services";

// Validation chain - Sử dụng cho bản express-validator 6 cho xuống
// export const testController = (req: Request, res: Response) => {
//   const errors = validationResult(req);
//   if (errors.isEmpty()) {
//     return res.status(200).send(`Hello, ${req.query.name}`);
//   }
//   return res.status(400).send({ errors: errors.array() });
// };

export const loginController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { user } = req;
  const userId = user?._id as ObjectId;
  const result = await usersServices.signIn(userId.toString());
  res.status(201).json({
    message: "Đăng nhập thành công",
    result,
  });
};

export const registerController = async (req: Request<ParamsDictionary, any, TSignUpReqBody>, res: Response) => {
  const result = await usersServices.signUp(req.body);
  res.status(201).json({
    message: "Đăng ký thành công",
    result,
  });
};
