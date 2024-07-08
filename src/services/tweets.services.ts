import { ObjectId, WithId } from "mongodb";
import { TweetTypeEnum, UserVerifyStatus } from "~/constants/enums";
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
        },
      },
    );

    return result.value as WithId<{
      guest_views: number;
      user_views: number;
    }>;
  }

  async getTweetChildren({
    tweet_id,
    limit = 5,
    page = 1,
    tweet_type,
  }: {
    tweet_id: ObjectId;
    limit?: number;
    page?: number;
    tweet_type?: string;
  }) {
    [
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
    ];
  }
}

const tweetsServices = new TweetsServices();
export default tweetsServices;
