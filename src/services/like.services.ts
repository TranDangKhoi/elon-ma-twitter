import { ObjectId } from "mongodb";
import Like from "~/models/schemas/Like.schema";
import databaseService from "~/services/database.services";

class LikeServices {
  async likePost(tweet_id: string, user_id: string) {
    const tweetObjectId = new ObjectId(tweet_id);
    const userObjectId = new ObjectId(user_id);
    const like = await databaseService.likes.findOneAndUpdate(
      {
        tweet_id: tweetObjectId,
        user_id: userObjectId,
      },
      {
        $setOnInsert: new Like({ tweet_id: tweetObjectId, user_id: userObjectId }),
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return like.value;
  }
}

const likeServices = new LikeServices();
export default likeServices;
