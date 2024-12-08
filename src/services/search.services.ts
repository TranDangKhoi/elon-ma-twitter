import { ObjectId } from "mongodb";
import { MediaEnum, TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import databaseService from "~/services/database.services";
import { utilInspect } from "~/utils/dev";

class SearchService {
  async advancedSearchAggregation({
    query,
    limit,
    page,
    user_id,
    media_type,
    only_followed_people,
    type,
  }: {
    query: string;
    limit: number;
    page: number;
    user_id: string;
    media_type?: MediaEnum;
    only_followed_people?: "true" | "false";
    type?: "latest" | "people" | "media";
  }) {
    const user_ids_this_account_follow = await databaseService.followers
      .find({
        user_id: new ObjectId(user_id),
      })
      .toArray();

    const $matchStageConditions: {
      $text: { $search: string };
      user_id?: { $in: ObjectId[] };
      "medias.type"?: MediaEnum;
    } = {
      $text: {
        $search: query,
      },
    };

    if (only_followed_people === "true") {
      $matchStageConditions["user_id"] = {
        $in: user_ids_this_account_follow.map((item) => item.being_followed_user_id),
      };
    }

    if (media_type) {
      if (media_type === MediaEnum.Image) {
        $matchStageConditions["medias.type"] = MediaEnum.Image;
      }
      if (media_type === MediaEnum.HLS) {
        $matchStageConditions["medias.type"] = MediaEnum.HLS;
      }
      // MediaEnum.Video is deprecated because i'm gonna be using HLS
      // if (media_type === MediaEnum.Video) {
      //   firstStage["media_type"] = MediaEnum.Video;
      // }
    }

    utilInspect([
      {
        $match: $matchStageConditions,
      },
    ]);

    if (!type) {
      return await databaseService.tweets
        .aggregate([
          {
            $match: $matchStageConditions,
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
                created_at: 0,
                updated_at: 0,
                website: 0,
                location: 0,
                date_of_birth: 0,
                forgot_password_token: 0,
                twitter_circle: 0,
                password: 0,
                email_verify_token: 0,
                verify: 0,
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
        .toArray();
    }
  }

  async calculateTotalAggregation({ query, user_id }: { query: string; user_id: string }) {
    const total = await databaseService.tweets
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
      .toArray();
    if (total.length === 0) {
      return [{ total: 0 }];
    }
    return total;
  }

  async peopleSearchAggregation({
    query,
    limit,
    page,
    user_id,
    only_followed_people,
  }: {
    query: string;
    limit: number;
    page: number;
    user_id: string;
    only_followed_people: "true" | "false";
  }) {
    const user_ids_this_account_follow = await databaseService.followers
      .find({
        user_id: new ObjectId(user_id),
      })
      .toArray();

    const $matchStageConditions: {
      $text: { $search: string };
      user_id?: { $in: ObjectId[] };
    } = {
      $text: {
        $search: query,
      },
    };

    if (only_followed_people === "true") {
      $matchStageConditions["user_id"] = {
        $in: user_ids_this_account_follow.map((item) => item.being_followed_user_id),
      };
    }

    return await databaseService.users
      .aggregate([
        {
          $match: $matchStageConditions,
        },
        {
          $lookup: {
            from: "followers",
            let: {
              user_id: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ["$being_followed_user_id", "$$user_id"],
                      },
                      {
                        $eq: ["$user_id", new ObjectId(user_id)],
                      },
                    ],
                  },
                },
              },
            ],
            as: "both_followed",
          },
        },
        {
          $addFields: {
            both_followed: {
              $size: "$both_followed",
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
      .toArray();
  }

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
    only_followed_people,
    media_type,
    type,
  }: {
    limit: number;
    page: number;
    query: string;
    user_id: string;
    only_followed_people: "true" | "false";
    media_type: MediaEnum;
    type?: "latest" | "people" | "media";
  }) {
    if (!type) {
      return await this.regularPostsSearch({
        limit,
        media_type,
        only_followed_people,
        page,
        query,
        user_id,
      });
    }

    // If we somehow didn't get the type, we will return an empty array
    return {
      tweets: [],
      total: 0,
    };
  }

  async regularPostsSearch({
    query,
    limit,
    page,
    user_id,
    only_followed_people,
    media_type,
  }: {
    query: string;
    limit: number;
    page: number;
    user_id: string;
    only_followed_people: "true" | "false";
    media_type: MediaEnum;
  }) {
    const [tweets, total] = await Promise.all([
      this.advancedSearchAggregation({ limit, page, query, user_id, media_type, only_followed_people }),
      this.calculateTotalAggregation({ query, user_id }),
    ]);
    const tweet_ids = tweets?.map((tweet) => tweet._id as ObjectId);
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

    tweets?.forEach((tweet) => {
      tweet.updated_at = currentDate;
      tweet.user_views += 1;
    });

    return {
      tweets,
      total: total[0].total,
    };
  }

  async peopleSearch({
    query,
    limit,
    page,
    user_id,
    only_followed_people,
  }: {
    query: string;
    limit: number;
    page: number;
    user_id: string;
    only_followed_people: "true" | "false";
  }) {
    const result = await this.peopleSearchAggregation({ query, limit, page, user_id, only_followed_people });
    return result;
  }
}

const searchService = new SearchService();
export default searchService;
