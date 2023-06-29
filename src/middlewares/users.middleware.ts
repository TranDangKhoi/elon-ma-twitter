import { checkSchema } from "express-validator";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { UserMessage } from "~/constants/messages.enum";
import { ErrorWithStatus } from "~/models/Errors";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";
import { hashPassword } from "~/utils/crypto";
import { verifyToken } from "~/utils/jwt";
import { validate } from "~/utils/validation";

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: UserMessage.EMAIL_IS_INVALID,
        },
        notEmpty: {
          errorMessage: UserMessage.EMAIL_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (values, { req }) => {
            const user = await databaseService.users.findOne({
              email: values,
              password: hashPassword(req.body.password),
            });
            if (user === null) {
              throw new Error(UserMessage.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }
            req.user = user;
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
    },
    ["body"],
  ),
);

export const registerValidator = validate(
  checkSchema(
    {
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
    },
    ["body"],
  ),
);

export const signOutValidator = validate(
  checkSchema(
    {
      authorization: {
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(" ")[1];
            const auth_type = value.split(" ")[0];
            if (!access_token || auth_type !== "Bearer") {
              throw new ErrorWithStatus({ message: UserMessage.TOKEN_INVALID, status: HttpStatusCode.UNAUTHORIZED });
            }
            const decoded_token = await verifyToken({ token: access_token });
            req.decoded_token = decoded_token;
            return true;
          },
        },
      },
    },
    ["headers"],
  ),
);
