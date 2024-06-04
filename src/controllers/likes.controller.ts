import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { TLikeReqBody } from "~/models/requests/Like.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import likeServices from "~/services/like.services";

export const likePostController = async (req: Request<ParamsDictionary, any, TLikeReqBody>, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const { tweet_id } = req.body;
  const result = await likeServices.likePost(tweet_id, user_id);
  res.status(200).send({
    result,
    message: "Like bài viết thành công",
  });
};
