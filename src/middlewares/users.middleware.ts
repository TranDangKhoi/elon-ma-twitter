import { NextFunction, Request, Response } from "express";
import { ParamSchema, checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enums";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { FollowMessage, UserMessage } from "~/constants/messages.enum";
import { REGEX_USERNAME } from "~/constants/regex";
import { ErrorWithStatus, UnprocessableEntityError } from "~/models/Errors";
import { TokenPayload } from "~/models/requests/User.requests";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";
import { hashPassword } from "~/utils/crypto";
import { verifyToken } from "~/utils/jwt";
import { validate } from "~/utils/validation";

// LƯU Ý KHI DÙNG trim: true thì nên để nó ở dưới tất cả mọi validation

const passwordSchema: ParamSchema = {
  isString: true,
  notEmpty: {
    errorMessage: UserMessage.PASSWORD_IS_REQUIRED,
  },
  isLength: { options: { min: 6, max: 50 }, errorMessage: UserMessage.PASSWORD_LENGTH_INVALID },
  trim: true,
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
};

const confirmPasswordSchema: ParamSchema = {
  isString: true,
  notEmpty: { errorMessage: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED },
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
  trim: true,
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(UserMessage.CONFIRM_PASSWORD_INVALID);
      }

      return true;
    },
  },
};

const confirmNewPasswordSchema: ParamSchema = {
  isString: true,
  notEmpty: { errorMessage: UserMessage.CONFIRM_PASSWORD_IS_REQUIRED },
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
  trim: true,
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error(UserMessage.CONFIRM_PASSWORD_INVALID);
      }

      return true;
    },
  },
};

const nameSchema: ParamSchema = {
  isString: true,
  notEmpty: {
    errorMessage: UserMessage.NAME_IS_REQUIRED,
  },
  trim: true,
  isLength: { options: { min: 1, max: 100 }, errorMessage: UserMessage.NAME_LENGTH_IS_INVALID },
};

const dateOfBirthSchema: ParamSchema = {
  notEmpty: true,
  isISO8601: { options: { strict: true, strictSeparator: true } },
};

const imageSchema: ParamSchema = {
  optional: true,
  isString: true,
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400,
    },
  },
};

const userIdSchema: ParamSchema = {
  isString: true,
  trim: true,
  custom: {
    options: (values, { req }) => {
      if (!ObjectId.isValid(values)) {
        throw new ErrorWithStatus({
          message: UserMessage.USER_NOT_FOUND,
          status: HttpStatusCode.NOT_FOUND,
        });
      }
    },
  },
};

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
      password: passwordSchema,
    },
    ["body"],
  ),
);

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
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
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema,
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
                message: UserMessage.ACCESS_TOKEN_INVALID,
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
                message: UserMessage.ACCESS_TOKEN_INVALID,
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
                message: UserMessage.REFRESH_TOKEN_IS_REQUIRED,
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
                  message: UserMessage.REFRESH_TOKEN_INVALID,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
              (req as Request).decoded_refresh_token = decoded_refresh_token;
              return true;
            } catch (err) {
              throw new ErrorWithStatus({
                message: UserMessage.REFRESH_TOKEN_INVALID,
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
                message: UserMessage.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
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
              message: UserMessage.EMAIL_VERIFY_TOKEN_INVALID,
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
          errorMessage: UserMessage.EMAIL_IS_INVALID,
        },
        notEmpty: {
          errorMessage: UserMessage.EMAIL_IS_REQUIRED,
        },
        trim: true,
        custom: {
          options: async (values, { req }) => {
            const user = await databaseService.users.findOne({ email: values });
            if (user === null) {
              throw new Error(UserMessage.EMAIL_DOES_NOT_EXIST);
            }
            req.user = user;
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
                message: UserMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
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
                  message: UserMessage.USER_NOT_FOUND,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
              if (foundUser.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: UserMessage.FORGOT_PASSWORD_TOKEN_INVALID,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
            } catch (err) {
              throw new ErrorWithStatus({
                message: UserMessage.FORGOT_PASSWORD_TOKEN_INVALID,
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

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: UserMessage.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
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
                  message: UserMessage.USER_NOT_FOUND,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
              if (foundUser.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: UserMessage.FORGOT_PASSWORD_TOKEN_INVALID,
                  status: HttpStatusCode.UNAUTHORIZED,
                });
              }
              (req as Request).decoded_forgot_password_token = decoded_forgot_password_token;
            } catch (err) {
              throw new ErrorWithStatus({
                message: UserMessage.FORGOT_PASSWORD_TOKEN_INVALID,
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

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: undefined,
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true,
      },
      bio: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 0,
            max: 200,
          },
        },
      },
      location: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 0,
            max: 200,
          },
        },
      },
      website: {
        optional: true,
        isString: true,
        trim: true,
        isLength: {
          options: {
            min: 0,
            max: 200,
          },
        },
      },
      username: {
        trim: true,
        optional: true,
        isString: true,
        isLength: {
          options: {
            min: 0,
            max: 50,
          },
        },
        custom: {
          options: async (values, { req }) => {
            if (!REGEX_USERNAME.test(values)) {
              throw Error(UserMessage.USERNAME_VALIDATION_ERROR);
            }
            const user = await databaseService.users.findOne({
              username: values,
            });
            if (user) {
              throw new ErrorWithStatus({
                message: UserMessage.USERNAME_ALREADY_EXISTS,
                status: HttpStatusCode.FORBIDDEN,
              });
            }
          },
        },
      },
      avatar: imageSchema,
      cover_photo: imageSchema,
    },
    ["body"],
  ),
);

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (values, { req }) => {
            const { user_id } = (req as Request).decoded_access_token as TokenPayload;
            const user = await databaseService.users.findOne({
              _id: new ObjectId(user_id),
            });
            if (!user) {
              throw new ErrorWithStatus({
                message: UserMessage.USER_NOT_FOUND,
                status: HttpStatusCode.NOT_FOUND,
              });
            }
            const { password } = user;
            const passwordIsMatched = password === hashPassword(values);
            if (!passwordIsMatched) {
              throw new ErrorWithStatus({
                message: UserMessage.OLD_PASSWORD_IS_MISMATCHED,
                status: HttpStatusCode.FORBIDDEN,
              });
            }
          },
        },
      },
      new_password: {
        ...passwordSchema,
        custom: {
          options: async (values, { req }) => {
            if (hashPassword(req.body.old_password) === hashPassword(values)) {
              throw new ErrorWithStatus({
                message: "Mật khẩu mới không được giống mật khẩu cũ",
                status: HttpStatusCode.FORBIDDEN,
              });
            }
            return true;
          },
        },
      },
      confirm_new_password: confirmNewPasswordSchema,
    },
    ["body"],
  ),
);

export const followUserValidator = validate(
  checkSchema(
    {
      being_followed_user_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: UserMessage.OBJECT_ID_INVALID,
                status: HttpStatusCode.NOT_FOUND,
              });
            }
            const foundUser = await databaseService.users.findOne({
              _id: new ObjectId(value),
            });
            if (!foundUser) {
              throw new ErrorWithStatus({
                message: UserMessage.USER_NOT_FOUND,
                status: HttpStatusCode.NOT_FOUND,
              });
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const unfollowUserValidator = validate(
  checkSchema(
    {
      being_followed_user_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: UserMessage.OBJECT_ID_INVALID,
                status: HttpStatusCode.NOT_FOUND,
              });
            }
            const foundUser = await databaseService.users.findOne({
              _id: new ObjectId(value),
            });
            if (!foundUser) {
              throw new ErrorWithStatus({
                message: UserMessage.USER_NOT_FOUND,
                status: HttpStatusCode.NOT_FOUND,
              });
            }
            return true;
          },
        },
      },
    },
    ["params"],
  ),
);

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_access_token as TokenPayload;
  if (verify !== UserVerifyStatus.VERIFIED) {
    return next(
      new ErrorWithStatus({
        message: "Bạn chưa xác thực e-mail, vui lòng xác thực e-mail",
        status: HttpStatusCode.FORBIDDEN,
      }),
    );
  }
  next();
};
