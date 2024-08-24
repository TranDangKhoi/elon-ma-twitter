import { ObjectId } from "mongodb";
import { TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import databaseService from "~/services/database.services";

class SearchService {
  // No lookup, no join, no populate, no aggregate, no sort, no filter, no pagination
  async simpleSearch({ query, limit, page }: { query: string; limit: number; page: number }) {
    const result = await databaseService.tweets
      .find({
        $text: {
          $search: query,
        },
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray();
    return result;
  }

  async advancedSearch({
    limit,
    page,
    query,
    user_id,
  }: {
    limit: number;
    page: number;
    query: string;
    user_id: string;
  }) {
    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              $text: {
                $search: query,
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
            },
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudienceEnum.EVERYONE,
                },
                {
                  $and: [
                    {
                      audience: TweetAudienceEnum.TWITTERCIRCLE,
                    },
                    {
                      "tweet_owner.twitter_circle": {
                        $in: [new ObjectId(user_id)],
                      },
                    },
                  ],
                },
                {
                  "tweet_owner._id": {
                    $eq: new ObjectId(user_id),
                  },
                },
              ],
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
                    email: "$$mention.email",
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
              as: "tweet_children",
            },
          },
          {
            $addFields: {
              bookmarks: {
                $size: "$bookmarks",
              },
              likes: {
                $size: "$likes",
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: "$tweet_children",
                    as: "item",
                    cond: {
                      $eq: ["$$item.type", TweetTypeEnum.RETWEET],
                    },
                  },
                },
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: "$tweet_children",
                    as: "item",
                    cond: {
                      $eq: ["$$item.type", TweetTypeEnum.COMMENT],
                    },
                  },
                },
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: "$tweet_children",
                    as: "item",
                    cond: {
                      $eq: ["$$item.type", TweetTypeEnum.QUOTETWEET],
                    },
                  },
                },
              },
            },
          },
          {
            $project: {
              tweet_children: 0,
              user: {
                password: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                date_of_birth: 0,
              },
            },
          },
          {
            $skip: limit * (page - 1),
          },
          {
            $limit: limit,
          },
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              $text: {
                $search: query,
              },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind: {
              path: "$user",
            },
          },
          {
            $match: {
              $or: [
                {
                  audience: TweetAudienceEnum.EVERYONE,
                },
                {
                  $and: [
                    {
                      audience: TweetAudienceEnum.TWITTERCIRCLE,
                    },
                    {
                      "tweet_owner.twitter_circle": {
                        $in: [new ObjectId(user_id)],
                      },
                    },
                  ],
                },
                {
                  "tweet_owner._id": {
                    $eq: new ObjectId(user_id),
                  },
                },
              ],
            },
          },
          {
            $count: "total",
          },
        ])
        .toArray(),
    ]);
    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId);
    const currentDate = new Date();
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids,
        },
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: currentDate,
        },
      },
    );

    tweets.forEach((tweet) => {
      tweet.updated_at = currentDate;
      tweet.user_views += 1;
    });
    return {
      tweets,
      total: total[0].total,
    };
  }
}

const searchService = new SearchService();
export default searchService;
