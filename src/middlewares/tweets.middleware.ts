import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import { TweetMessage } from "~/constants/messages.constants";
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
      parent_id: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            if (req.body.type !== TweetTypeEnum.TWEET && !value) {
              throw new Error(TweetMessage.PARENT_ID_IS_REQUIRED);
            }
            if (req.body.type !== TweetTypeEnum.TWEET && !ObjectId.isValid(value)) {
              throw new Error(TweetMessage.PARENT_ID_CAN_NOT_BE_INVALID);
            }
            if (req.body.type === TweetTypeEnum.TWEET && value) {
              throw new Error(TweetMessage.PARENT_ID_MUST_BE_NULL);
            }
          },
        },
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const hashtags = req.body.hashtags || [];
            const mentions = req.body.mentions || [];
            if (req.body.type === TweetTypeEnum.RETWEET && value !== "") {
              throw new Error(TweetMessage.CONTENT_MUST_BE_EMPTY);
            }
            if (
              [TweetTypeEnum.TWEET, TweetTypeEnum.QUOTETWEET, TweetTypeEnum.COMMENT].includes(req.body.type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              value === ""
            ) {
              throw new Error(TweetMessage.CONTENT_IS_REQUIRED);
            }
          },
        },
      },
      hashtags: {
        isArray: true,
        optional: true,
      },
      mentions: {
        isArray: true,
        optional: true,
      },
      medias: {
        isArray: true,
        optional: true,
      },
    },
    ["body"],
  ),
);
