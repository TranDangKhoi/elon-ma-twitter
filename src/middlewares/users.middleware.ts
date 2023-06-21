import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { OptionalOptions } from "express-validator/src/chain";
import { validate } from "~/utils/validation";
import usersRouters from "../routes/users.routes";
const currentDate = new Date();

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
    email: { isEmail: true, notEmpty: true, trim: true, isLength: { options: { min: 1, max: 150 } } },
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
