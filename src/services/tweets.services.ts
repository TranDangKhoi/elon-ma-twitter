import { ObjectId, WithId } from "mongodb";
import { TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import { TTweetReqBody } from "~/models/requests/Tweet.requests";
import Hashtag from "~/models/schemas/Hashtag.schema";
import Tweet from "~/models/schemas/Tweet.schema";
import databaseService from "~/services/database.services";

class TweetsServices {
  async checkAndCreateHashTags(hashtags: string[]) {
    const hashTagsToInsert = Promise.all(
      hashtags.map((hashtag) =>
        databaseService.hashtags.findOneAndUpdate(
          {
            name: hashtag,
          },
          {
            $setOnInsert: new Hashtag({ name: hashtag }),
          },
          {
            upsert: true,
            returnDocument: "after",
          },
        ),
      ),
    );
    return (await hashTagsToInsert).map((hashtag) => hashtag.value?._id as ObjectId);
  }

  async createTweets(body: TTweetReqBody, user_id: string) {
    const hashtags = await this.checkAndCreateHashTags(body.hashtags);
    const parent_id = body.parent_id ? new ObjectId(body.parent_id) : null;
    const newTweet = await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        content: body.content,
        parent_id,
        audience: body.audience,
        type: body.type,
        hashtags: hashtags,
        mentions: body.mentions,
        medias: body.medias,
        guest_views: 0,
        user_views: 0,
      }),
    );
    const theTweetThatWasJustCreated = await databaseService.tweets.findOne({ _id: newTweet.insertedId });
    return theTweetThatWasJustCreated;
  }

  async increaseTweetViewCount(tweet_id: ObjectId, user_id?: string) {
    const viewsType = user_id ? { user_views: 1 } : { guest_views: 1 };
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: tweet_id },
      {
        $inc: viewsType,
        $currentDate: {
          updated_at: true,
        },
      },
      {
        returnDocument: "after",
        projection: {
          user_views: 1,
          guest_views: 1,
          updated_at: 1,
        },
      },
    );

    return result.value as WithId<{
      guest_views: number;
      user_views: number;
      updated_at: Date;
    }>;
  }

  async getTweetChildren({
    tweet_id,
    user_id,
    limit,
    page,
    tweet_type = TweetTypeEnum.COMMENT,
  }: {
    tweet_id: ObjectId;
    user_id?: ObjectId;
    limit: number;
    page: number;
    tweet_type: TweetTypeEnum;
  }) {
    const viewsTypeToBeIncreased = user_id ? { user_views: 1 } : { guest_views: 1 };

    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            parent_id: new ObjectId(tweet_id),
            type: tweet_type,
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
                    $eq: ["$$item.type", TweetTypeEnum.RETWEET],
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
                    $eq: ["$$item.type", TweetTypeEnum.COMMENT],
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
                    $eq: ["$$item.type", TweetTypeEnum.QUOTETWEET],
                  },
                },
              },
            },
          },
        },
        {
          $skip: limit * (page - 1), // Công thức phân trang
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    // Increase views for tweet children
    const ids = tweets.map((tweet) => tweet._id);

    const [_, total_documents] = await Promise.all([
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: ids,
          },
        },
        {
          $inc: viewsTypeToBeIncreased,
          $currentDate: {
            updated_at: true,
          },
        },
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type: tweet_type,
      }),
    ]);

    tweets.forEach((tweet) => {
      if (user_id) {
        tweet.user_views += 1;
      } else {
        tweet.guest_views += 1;
      }
    });

    const total_pages = Math.ceil(total_documents / limit);

    return {
      tweets,
      total_documents,
      total_pages,
    };
  }

  async getNewFeed({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_ids_this_account_follow = await databaseService.followers
      .find({
        user_id: new ObjectId(user_id),
      })
      .toArray();
    const ids = user_ids_this_account_follow.map((user) => user.being_followed_user_id);
    const tweets = await databaseService.tweets
      .aggregate([
        {
          $match: {
            user_id: {
              $in: ids,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "tweet_owner",
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
          $skip: limit * (page - 1),
        },
        {
          $limit: limit,
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
          $unwind: {
            path: "$tweet_owner",
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
                    $eq: ["$$item.type", TweetTypeEnum.RETWEET],
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
                    $eq: ["$$item.type", TweetTypeEnum.COMMENT],
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
                    $eq: ["$$item.type", TweetTypeEnum.QUOTETWEET],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            tweets_children: 0,
            tweet_owner: {
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
      ])
      .toArray();

    const tweet_ids = tweets.map((tweet) => tweet._id);

    const [_, total_documents] = await Promise.all([
      await databaseService.tweets.updateMany(
        {
          _id: {
            $in: tweet_ids,
          },
        },
        {
          $inc: {
            user_views: 1,
          },
          $currentDate: {
            updated_at: true,
          },
        },
      ),
      await databaseService.tweets.countDocuments({
        user_id: {
          $in: ids,
        },
      }),
    ]);
    const currentDate = new Date();
    const total_pages = Math.ceil(total_documents / limit);

    tweets.forEach((tweet) => {
      tweet.updated_at = currentDate;
      tweet.user_views += 1;
    });

    return {
      tweets,
      total_pages,
      limit,
      page,
    };
  }
}

const tweetsServices = new TweetsServices();
export default tweetsServices;
