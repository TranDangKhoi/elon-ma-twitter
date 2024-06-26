import { Request, Response } from "express";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { TweetMessage } from "~/constants/messages.constants";
import { ParamsDictionary } from "express-serve-static-core";
import tweetsServices from "~/services/tweets.services";
import { TTweetReqBody } from "~/models/requests/Tweet.requests";
import { TokenPayload } from "~/models/requests/User.requests";

export const getTweetController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  res.status(HttpStatusCode.OK).json({
    message: TweetMessage.GET_TWEET_SUCCESSFULLY,
  });
};

export const createTweetController = async (req: Request<ParamsDictionary, any, TTweetReqBody>, res: Response) => {
  const tweetRequestBody = req.body;
  const decoded_access_token = req.decoded_access_token;
  const { user_id } = decoded_access_token as TokenPayload;
  const result = await tweetsServices.createTweets(tweetRequestBody, user_id);
  res.status(HttpStatusCode.OK).json({
    message: TweetMessage.TWEET_SUCCESSFULLY,
    result,
  });
};
