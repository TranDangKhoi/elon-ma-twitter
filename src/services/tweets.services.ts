import { ObjectId } from "mongodb";
import { TTweetReqBody } from "~/models/requests/Tweet.requests";
import Tweet from "~/models/schemas/Tweet.schema";
import databaseService from "~/services/database.services";

class TweetsServices {
  async createTweets(body: TTweetReqBody, user_id: string) {
    const newTweet = await databaseService.tweets.insertOne(
      new Tweet({
        user_id: new ObjectId(user_id),
        content: body.content,
        parent_id: null,
        audience: body.audience,
        type: body.type,
        hashtags: [],
        mentions: body.mentions,
        medias: body.medias,
        guest_views: 0,
        user_views: 0,
      }),
    );
    const theTweetThatWasJustCreated = await databaseService.tweets.findOne({ _id: newTweet.insertedId });
    return theTweetThatWasJustCreated;
  }
}

const tweetsServices = new TweetsServices();
export default tweetsServices;
