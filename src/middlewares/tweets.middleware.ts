import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import { enumValuesToArray } from "~/utils/enumsToArray";
import { validate } from "~/utils/validation";

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isString: true,
        isIn: {
          options: enumValuesToArray(TweetTypeEnum),
          errorMessage: `Kiểu tweet phải là một trong các giá trị sau: ${enumValuesToArray(TweetTypeEnum).join(", ")}`,
        },
      },
      audience: {
        isString: true,
        isIn: {
          options: enumValuesToArray(TweetAudienceEnum),
          errorMessage: `Đối tượng xem tweet phải là một trong các giá trị sau: ${enumValuesToArray(
            TweetAudienceEnum,
          ).join(", ")}`,
        },
      },
      content: {
        isString: true,
      },
      parent_id: {
        isString: true,
        optional: true,
      },
      hashtags: {
        isArray: true,
      },
      mentions: {
        isArray: true,
      },
      medias: {
        isArray: true,
        optional: true,
      },
    },
    ["body"],
  ),
);
