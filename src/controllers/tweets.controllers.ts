import { ObjectId } from "mongodb";
import { ParamsDictionary } from "express-serve-static-core";
import { Request, Response } from "express";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { TweetMessage } from "~/constants/messages.constants";
import tweetsServices from "~/services/tweets.services";
import { TTweetParams, TTweetQuery, TTweetReqBody } from "~/models/requests/Tweet.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import { TweetTypeEnum } from "~/constants/enums";

export const getTweetController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  const { tweet } = req;
  const { user_id } = (req.decoded_access_token as TokenPayload) || {};
  const updatedTweetViews = await tweetsServices.increaseTweetViewCount(tweet?._id as ObjectId, user_id);
  const result = {
    ...tweet,
    ...updatedTweetViews,
  };
  res.status(HttpStatusCode.OK).json({
    message: TweetMessage.GET_TWEET_SUCCESSFULLY,
    result,
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

export const getTweetChildrenController = async (req: Request<TTweetParams, any, any, TTweetQuery>, res: Response) => {
  const limit = Number(req.query.limit) || 5;
  const page = Number(req.query.page) || 1;
  const tweet_type = Number(req.query.tweet_type) || TweetTypeEnum.COMMENT;
  const { user_id } = (req.decoded_access_token as TokenPayload) || {};
  const { tweets, total_documents, total_pages } = await tweetsServices.getTweetChildren({
    tweet_id: new ObjectId(req.params.tweet_id),
    user_id: new ObjectId(user_id),
    tweet_type,
    limit,
    page,
  });
  res.status(HttpStatusCode.OK).json({
    message: TweetMessage.GET_COMMENTS_SUCCESSFULLY,
    result: {
      tweets,
      limit,
      page,
      total_documents,
      total_pages,
      tweet_type,
    },
  });
};
