import { ObjectId } from "mongodb";
import { TTweetReqBody } from "~/models/requests/Tweet.requests";
import Tweet from "~/models/schemas/Tweet.schema";
import databaseService from "~/services/database.services";

class TweetsServices {
  async createTweets(body: TTweetReqBody) {
    // const currentUserId
    // const newTweet = await databaseService.tweets.insertOne(
    //   new Tweet({
    //     ...body,
    //     guest_views: 0,
    //     user_views: 0,
    //     user_id: new ObjectId(),
    //   }),
    // );
    return body;
  }
}

const tweetsServices = new TweetsServices();
export default tweetsServices;
