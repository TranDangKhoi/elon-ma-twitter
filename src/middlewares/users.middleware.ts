import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { UserMessage } from "~/constants/messages.enum";
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
    name: {
      isString: true,
      notEmpty: {
        errorMessage: UserMessage.NAME_IS_REQUIRED,
      },
      trim: true,
      isLength: { options: { min: 1, max: 100 }, errorMessage: UserMessage.NAME_LENGTH_IS_INVALID },
    },
    email: {
      isEmail: {
        errorMessage: UserMessage.EMAIL_IS_INVALID,
      },
      notEmpty: {
        errorMessage: UserMessage.EMAIL_IS_REQUIRED,
      },
      trim: true,
      custom: {
        options: async (values) => {
          const emailExisted = await usersServices.checkEmailExist(values);
          if (emailExisted) {
            throw new Error(UserMessage.EMAIL_ALREADY_EXISTS);
          }
          return true;
        },
      },
    },
    password: {
      isString: true,
      notEmpty: {
        errorMessage: UserMessage.PASSWORD_IS_REQUIRED,
      },
      trim: true,
      isLength: { options: { min: 6, max: 50 }, errorMessage: UserMessage.PASSWORD_LENGTH_INVALID },
      isStrongPassword: {
        errorMessage: UserMessage.PASSWORD_MUST_BE_STRONG,
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
      notEmpty: { errorMessage: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED },
      trim: true,
      isLength: { options: { min: 6, max: 50 }, errorMessage: UserMessage.CONFIRM_PASSWORD_LENGTH_INVALID },
      isStrongPassword: {
        errorMessage: UserMessage.CONFIRM_PASSWORD_MUST_BE_STRONG,
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
            throw new Error(UserMessage.CONFIRM_PASSWORD_INVALID);
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
