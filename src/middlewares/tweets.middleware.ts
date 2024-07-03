import { NextFunction, Request, Response } from "express";
import { checkSchema } from "express-validator";
import { isEmpty } from "lodash";
import { ObjectId } from "mongodb";
import { MediaEnum, TweetAudienceEnum, TweetTypeEnum, UserVerifyStatus } from "~/constants/enums";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { TweetMessage, UserMessage } from "~/constants/messages.constants";
import { ErrorWithStatus } from "~/models/Errors";
import Tweet from "~/models/schemas/Tweet.schema";
import databaseService from "~/services/database.services";
import { enumValuesToArray } from "~/utils/enumsToArray";
import { wrapRequestHandler } from "~/utils/requestHandlers";
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
          options: async (value, { req }) => {
            if (req.body.type !== TweetTypeEnum.TWEET && !value) {
              throw new Error(TweetMessage.PARENT_ID_IS_REQUIRED);
            }
            if (req.body.type !== TweetTypeEnum.TWEET && !ObjectId.isValid(value)) {
              throw new Error(TweetMessage.PARENT_ID_CAN_NOT_BE_INVALID);
            }
            if (req.body.type === TweetTypeEnum.TWEET && value) {
              throw new Error(TweetMessage.PARENT_ID_MUST_BE_NULL);
            }
            // Kiểm tra nếu Parent Tweet bật Twitter Circle thì không cho phép ReTweet hoặc QuoteTweet
            if (value) {
              const parentTweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) });
              if (
                parentTweet?.audience === TweetAudienceEnum.TWITTERCIRCLE &&
                (req.body.type === TweetTypeEnum.RETWEET || req.body.type === TweetTypeEnum.QUOTETWEET)
              ) {
                throw new Error(TweetMessage.TWEET_TYPE_MUST_BE_PUBLIC);
              }
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
            const [tweet] = await databaseService.tweets
              .aggregate<Tweet>([
                {
                  $match: {
                    _id: new ObjectId(value),
                  },
                },
                {
                  $lookup: {
                    from: "hashtags",
                    localField: "hashtags",
                    foreignField: "_id",
                    as: "hashtags",
                  },
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "mentions",
                    foreignField: "_id",
                    as: "mentions",
                  },
                },
                {
                  $addFields: {
                    mentions: {
                      $map: {
                        input: "$mentions",
                        as: "mention",
                        in: {
                          _id: "$$mention._id",
                          name: "$$mention.name",
                          username: "$$mention.username",
                        },
                      },
                    },
                  },
                },
                {
                  $lookup: {
                    from: "bookmarks",
                    localField: "_id",
                    foreignField: "tweet_id",
                    as: "bookmarks",
                  },
                },
                {
                  $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "tweet_id",
                    as: "likes",
                  },
                },
                {
                  $lookup: {
                    from: "tweets",
                    localField: "_id",
                    foreignField: "parent_id",
                    as: "tweets_children",
                  },
                },
                {
                  $addFields: {
                    bookmarks_count: {
                      $size: "$bookmarks",
                    },
                    likes_count: {
                      $size: "$likes",
                    },
                    retweets_count: {
                      $size: {
                        $filter: {
                          input: "$tweets_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", 1],
                          },
                        },
                      },
                    },
                    comments_count: {
                      $size: {
                        $filter: {
                          input: "$tweets_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", 2],
                          },
                        },
                      },
                    },
                    quote_tweets_count: {
                      $size: {
                        $filter: {
                          input: "$tweets_children",
                          as: "item",
                          cond: {
                            $eq: ["$$item.type", 3],
                          },
                        },
                      },
                    },
                    views_count: {
                      $add: ["$guest_views", "$user_views"],
                    },
                  },
                },
              ])
              .toArray();
            if (!tweet) {
              throw new Error(TweetMessage.TWEET_NOT_FOUND);
            }
            (req as Request).tweet = tweet;
            return true;
          },
        },
      },
    },
    ["params", "body"],
  ),
);

// If you want to use async await in a middleware, you need to wrap it in a wrapRequestHandler function
// or you can use try catch, and call next with the error
export const audienceValidator = wrapRequestHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet;
  if (tweet?.audience === TweetAudienceEnum.TWITTERCIRCLE) {
    if (!req.decoded_access_token) {
      throw new ErrorWithStatus({
        status: HttpStatusCode.UNAUTHORIZED,
        message: UserMessage.ACCESS_TOKEN_IS_REQUIRED,
      });
    }

    // Check if the OP's account are banned
    const tweetOwner = await databaseService.users.findOne({ _id: new ObjectId(tweet.user_id) });
    if (!tweetOwner || tweetOwner.verify === UserVerifyStatus.BANNED) {
      throw new ErrorWithStatus({
        status: HttpStatusCode.NOT_FOUND,
        message: UserMessage.USER_NOT_FOUND,
      });
    }

    const { user_id } = req.decoded_access_token;
    const isInTwitterCircle = tweetOwner.twitter_circle?.some((user_circle_id) => user_circle_id.equals(user_id));
    if (!isInTwitterCircle && !tweetOwner._id.equals(new ObjectId(user_id))) {
      throw new ErrorWithStatus({
        status: HttpStatusCode.FORBIDDEN,
        message: TweetMessage.TWEET_INSUFFICIENT_PERMISSION,
      });
    }
  }
  next();
});
