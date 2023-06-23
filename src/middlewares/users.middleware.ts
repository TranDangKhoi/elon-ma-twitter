import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import usersServices from "~/services/users.services";
import { validate } from "~/utils/validation";

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Missing email or password");
  }
  next();
};

export const registerValidator = validate(
  checkSchema({
    name: { isString: true, notEmpty: true, trim: true, isLength: { options: { min: 1, max: 100 } } },
    email: {
      isEmail: true,
      notEmpty: true,
      trim: true,
      isLength: { options: { min: 1, max: 150 } },
      custom: {
        options: async (values) => {
          const emailExisted = await usersServices.checkEmailExist(values);
          if (emailExisted) {
            throw new Error("Địa chỉ e-mail đã tồn tại, vui lòng sử dụng một e-mail khác");
          }
          return emailExisted;
        },
        errorMessage: "Địa chỉ e-mail đã tồn tại, vui lòng sử dụng một e-mail khác",
      },
    },
    password: {
      isString: true,
      notEmpty: true,
      trim: true,
      isLength: { options: { min: 6, max: 50 } },
      isStrongPassword: {
        errorMessage:
          "Mật khẩu cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        },
      },
    },
    confirm_password: {
      isString: true,
      notEmpty: true,
      trim: true,
      isLength: { options: { min: 6, max: 50 } },
      isStrongPassword: {
        errorMessage:
          "Mật khẩu cần có ít nhất 6 ký tự và chứa ít nhất một chữ thường, một chữ in hoa, một chữ số và một ký tự đặc biệt",
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        },
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Mật khẩu xác thực không khớp");
          }
          return true;
        },
      },
    },
    date_of_birth: {
      notEmpty: true,
      isISO8601: { options: { strict: true, strictSeparator: true } },
    },
  }),
);
