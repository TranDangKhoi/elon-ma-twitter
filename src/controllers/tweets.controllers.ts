import { Request, Response } from "express";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { TweetMessage } from "~/constants/messages.constants";
import { ParamsDictionary } from "express-serve-static-core";
import tweetsServices from "~/services/tweets.services";
import { TTweetReqBody } from "~/models/requests/Tweet.requests";

export const createTweetController = async (req: Request<ParamsDictionary, any, TTweetReqBody>, res: Response) => {
  const tweetRequestBody = req.body;
  const newTweet = await tweetsServices.createTweets(tweetRequestBody);
  res.status(HttpStatusCode.OK).json({
    message: TweetMessage.TWEET_SUCCESSFULLY,
    result: newTweet,
  });
};
