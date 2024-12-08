import { checkSchema } from "express-validator";
import { ObjectId } from "mongodb";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { UserMessage } from "~/constants/messages.constants";
import { ErrorWithStatus } from "~/models/Errors";
import databaseService from "~/services/database.services";
import { validate } from "~/utils/validation";

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
