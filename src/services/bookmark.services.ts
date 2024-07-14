import { ObjectId } from "mongodb";
import Bookmark from "~/models/schemas/Bookmark.schema";
import databaseService from "~/services/database.services";

class BookmarkServices {
  async getBookmarks(user_id: string) {
    const userObjectId = new ObjectId(user_id);
    const bookmarks = await databaseService.bookmarks
      .aggregate([
        {
          $match: {
            user_id: userObjectId,
          },
        },
        {
          $lookup: {
            from: "tweets",
            localField: "tweet_id",
            foreignField: "_id",
            as: "tweet",
          },
        },
        {
          $unwind: "$tweet",
        },
        {
          $project: {
            tweet: 1,
          },
        },
      ])
      .toArray();
    return bookmarks;
  }

  async createBookmark(tweet_id: string, user_id: string) {
    const tweetObjectId = new ObjectId(tweet_id);
    const userObjectId = new ObjectId(user_id);
    const bookmark = await databaseService.bookmarks.findOneAndUpdate(
      {
        tweet_id: tweetObjectId,
        user_id: userObjectId,
      },
      {
        $setOnInsert: new Bookmark({ tweet_id: tweetObjectId, user_id: userObjectId }),
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return bookmark.value;
  }

  async removeBookmark(tweet_id: string, user_id: string) {
    const tweetObjectId = new ObjectId(tweet_id);
    const userObjectId = new ObjectId(user_id);
    const bookmark = await databaseService.bookmarks.findOneAndDelete({
      tweet_id: tweetObjectId,
      user_id: userObjectId,
    });

    return bookmark.value;
  }

  async checkBookmark(tweet_id: string, user_id: string) {
    const tweetObjectId = new ObjectId(tweet_id);
    const userObjectId = new ObjectId(user_id);
    const bookmark = await databaseService.bookmarks.findOne({
      tweet_id: tweetObjectId,
      user_id: userObjectId,
    });

    return bookmark;
  }
}

const bookmarkServices = new BookmarkServices();
export default bookmarkServices;
