import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { MediaEnum, TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import { TweetMessage } from "~/constants/messages.constants";
import databaseService from "~/services/database.services";
import tweetsServices from "~/services/tweets.services";
import { enumValuesToArray } from "~/utils/enumsToArray";
import { validate } from "~/utils/validation";

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [enumValuesToArray(TweetTypeEnum)],
          errorMessage: `Kiểu tweet phải là một trong các giá trị sau: ${enumValuesToArray(TweetTypeEnum).join(", ")}`,
        },
      },
      audience: {
        isIn: {
          options: [enumValuesToArray(TweetAudienceEnum)],
          errorMessage: `Đối tượng xem tweet phải là một trong các giá trị sau: ${enumValuesToArray(
            TweetAudienceEnum,
          ).join(", ")}`,
        },
      },
      parent_id: {
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
            return true;
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
            return true;
          },
        },
      },
      hashtags: {
        isArray: true,
        optional: true,
        custom: {
          options: async (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array phải là một string
            if (value.some((item: string) => typeof item !== "string")) {
              throw new Error(TweetMessage.HASHTAGS_MUST_BE_STRINGS);
            }
            return true;
          },
        },
      },
      mentions: {
        isArray: true,
        optional: true,
        custom: {
          options: async (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array phải là một user_id
            if (value.some((item: string | ObjectId) => !ObjectId.isValid(item))) {
              throw new Error(TweetMessage.MENTIONS_MUST_BE_STRINGS);
            }
            return true;
          },
        },
      },
      medias: {
        isArray: true,
        optional: true,
        custom: {
          options: async (value, { req }) => {
            // Yêu cầu mỗi phần tử trong array phải là một object có các key-value như sau:
            // {
            //   url: string,
            //   type: MediaEnum,
            // }
            if (
              value.some(
                (item: any) => typeof item?.url !== "string" || enumValuesToArray(MediaEnum).includes(item?.type),
              )
            ) {
              throw new Error(TweetMessage.MEDIAS_MUST_BE_OBJECTS);
            }
            return true;
          },
        },
      },
    },
    ["body"],
  ),
);

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isMongoId: true,
        custom: {
          options: async (value, { req }) => {
            const tweet = await databaseService.tweets.findOne({
              _id: new ObjectId(value),
            });
            if (!tweet) {
              throw new Error(TweetMessage.TWEET_NOT_FOUND);
            }
            return true;
          },
        },
      },
    },
    ["params", "body"],
  ),
);
