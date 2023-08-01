import { Request } from "express";
import { check, checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { ValidationMessage } from "~/constants/messages.enum";
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
          errorMessage: ValidationMessage.EMAIL_IS_INVALID,
        },
        notEmpty: {
          errorMessage: ValidationMessage.EMAIL_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (values, { req }) => {
            const user = await databaseService.users.findOne({
              email: values,
              password: hashPassword(req.body.password),
            });
            if (user === null) {
              throw new Error(ValidationMessage.EMAIL_OR_PASSWORD_IS_INCORRECT);
            }
            req.user = user;
            return true;
          },
        },
      },
      password: {
        isString: true,
        notEmpty: {
          errorMessage: ValidationMessage.PASSWORD_IS_REQUIRED,
        },
        trim: true,
        isLength: { options: { min: 6, max: 50 }, errorMessage: ValidationMessage.PASSWORD_LENGTH_INVALID },
        isStrongPassword: {
          errorMessage: ValidationMessage.PASSWORD_MUST_BE_STRONG,
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
          errorMessage: ValidationMessage.NAME_IS_REQUIRED,
        },
        trim: true,
        isLength: { options: { min: 1, max: 100 }, errorMessage: ValidationMessage.NAME_LENGTH_IS_INVALID },
      },
      email: {
        isEmail: {
          errorMessage: ValidationMessage.EMAIL_IS_INVALID,
        },
        notEmpty: {
          errorMessage: ValidationMessage.EMAIL_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (values) => {
            const emailExisted = await usersServices.checkEmailExist(values);
            if (emailExisted) {
              throw new Error(ValidationMessage.EMAIL_ALREADY_EXISTS);
            }
            return true;
          },
        },
      },
      password: {
        isString: true,
        notEmpty: {
          errorMessage: ValidationMessage.PASSWORD_IS_REQUIRED,
        },
        trim: true,
        isLength: { options: { min: 6, max: 50 }, errorMessage: ValidationMessage.PASSWORD_LENGTH_INVALID },
        isStrongPassword: {
          errorMessage: ValidationMessage.PASSWORD_MUST_BE_STRONG,
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
        notEmpty: { errorMessage: ValidationMessage.CONFIRM_PASSWORD_IS_REQUIRED },
        trim: true,
        isLength: { options: { min: 6, max: 50 }, errorMessage: ValidationMessage.CONFIRM_PASSWORD_LENGTH_INVALID },
        isStrongPassword: {
          errorMessage: ValidationMessage.CONFIRM_PASSWORD_MUST_BE_STRONG,
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
              throw new Error(ValidationMessage.CONFIRM_PASSWORD_INVALID);
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

export const accessTokenValidator = validate(
  checkSchema(
    {
      authorization: {
        custom: {
          options: async (value, { req }) => {
            const access_token = (value || "").split(" ")[1];
            const auth_type = value.split(" ")[0];
            if (!access_token || auth_type !== "Bearer") {
              throw new ErrorWithStatus({
                message: ValidationMessage.ACCESS_TOKEN_INVALID,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
            try {
              const decoded_access_token = await verifyToken({
                token: access_token,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN,
              });
              (req as Request).decoded_access_token = decoded_access_token;
            } catch (err) {
              throw new ErrorWithStatus({
                message: ValidationMessage.ACCESS_TOKEN_INVALID,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
            return true;
          },
        },
      },
    },
    ["headers"],
  ),
);

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ValidationMessage.REFRESH_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
            try {
              const [decoded_refresh_token, found_refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN }),
                databaseService.refreshTokens.findOne({ token: value }),
              ]);
              if (!found_refresh_token) {
                throw new ErrorWithStatus({
                  message: ValidationMessage.REFRESH_TOKEN_INVALID,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
              (req as Request).decoded_refresh_token = decoded_refresh_token;
              return true;
            } catch (err) {
              throw new ErrorWithStatus({
                message: ValidationMessage.REFRESH_TOKEN_INVALID,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
          },
        },
      },
    },
    ["body"],
  ),
);

export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      trim: true,
      custom: {
        options: async (value, { req }) => {
          try {
            if (!value) {
              throw new ErrorWithStatus({
                message: ValidationMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
            // const [decoded_email_verify_token, found_email_verify_token] = await Promise.all([
            //   verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN }),
            //   databaseService.refreshTokens.findOne({ token: value }),
            // ]);
            const decoded_email_verify_token = await verifyToken({
              token: value,
              secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
            });

            (req as Request).decoded_email_verify_token = decoded_email_verify_token;
            return true;
          } catch (err) {
            throw new ErrorWithStatus({
              message: ValidationMessage.EMAIL_VERIFY_TOKEN_INVALID,
              status: HttpStatusCode.UNAUTHORIZED,
            });
          }
        },
      },
    },
  }),
);

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: ValidationMessage.EMAIL_IS_INVALID,
        },
        notEmpty: {
          errorMessage: ValidationMessage.EMAIL_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (values) => {
            const emailExisted = await usersServices.checkEmailExist(values);
            if (!emailExisted) {
              throw new Error(ValidationMessage.EMAIL_DOES_NOT_EXIST);
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: ValidationMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
            try {
              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
              });
              const foundUser = await databaseService.users.findOne({
                _id: new ObjectId(decoded_forgot_password_token.user_id),
              });
              if (!foundUser) {
                throw new ErrorWithStatus({
                  message: ValidationMessage.USER_NOT_FOUND,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
              if (foundUser.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: ValidationMessage.FORGOT_PASSWORD_TOKEN_INVALID,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
            } catch (err) {
              throw new ErrorWithStatus({
                message: ValidationMessage.FORGOT_PASSWORD_TOKEN_INVALID,
                status: HttpStatusCode.UNAUTHORIZED,
              });
            }
          },
        },
      },
    },
    ["body"],
  ),
);
