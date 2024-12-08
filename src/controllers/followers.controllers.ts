import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { FollowMessage, SearchMessage, UserMessage } from "~/constants/messages.constants";
import { TokenPayload } from "~/models/requests/User.requests";
import usersServices from "~/services/users.services";
import { TSearchParams } from "~/models/requests/Search.requests";
import { TFollowUserReqBody, TUnfollowedReqParams } from "~/models/requests/User.requests";
import followersService from "~/services/followers.services";
export const getFollowersController = async (
  req: Request<ParamsDictionary, any, any, TSearchParams>,
  res: Response,
) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const { limit, page, query } = req.query;
  const limitNumber = Number(limit) || 10;
  const currentPage = Number(page) || 1;
  const result = await followersService.getMeFollowers({ user_id, limit: limitNumber, page: currentPage, query });
  res.status(HttpStatusCode.OK).json({
    message: SearchMessage.SEARCH_SUCCESSFULLY,
    result,
  });
};

export const followUserController = async (req: Request<ParamsDictionary, any, TFollowUserReqBody>, res: Response) => {
  const { user_id: current_user_id } = req.decoded_access_token as TokenPayload;
  const { being_followed_user_id } = req.body;
  const result = await followersService.followUser(current_user_id, being_followed_user_id);
  res.status(HttpStatusCode.OK).json({
    message: FollowMessage.FOLLOW_SUCCESSFULLY,
    result,
  });
};

export const unfollowUserController = async (req: Request<TUnfollowedReqParams>, res: Response) => {
  const { user_id: current_user_id } = req.decoded_access_token as TokenPayload;
  const { being_followed_user_id } = req.params;
  const result = await followersService.unfollowUser(current_user_id, being_followed_user_id);
  res.status(HttpStatusCode.OK).json({
    message: FollowMessage.UNFOLLOW_SUCCESSFULLY,
    result,
  });
};
