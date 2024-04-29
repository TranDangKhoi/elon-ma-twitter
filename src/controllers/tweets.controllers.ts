import { Request, Response } from "express";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { TweetMessage } from "~/constants/messages.enum";

export const createTweetController = async (req: Request, res: Response) => {
  res.status(HttpStatusCode.OK).json({
    message: TweetMessage.TWEET_SUCCESSFULLY,
  });
};
