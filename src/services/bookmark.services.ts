import { ObjectId } from "mongodb";
import Bookmark from "~/models/schemas/Bookmark.schema";
import databaseService from "~/services/database.services";

class BookmarkServices {
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
}

const bookmarkServices = new BookmarkServices();
export default bookmarkServices;
