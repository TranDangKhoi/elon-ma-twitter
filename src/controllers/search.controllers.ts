import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { TSearchFiltersParams, TSearchParams } from "~/models/requests/Search.requests";
import searchService from "~/services/search.services";
import { SearchMessage } from "~/constants/messages.constants";
import { TokenPayload } from "~/models/requests/User.requests";
import { MediaEnum } from "~/constants/enums";

export const simpleSearchController = async (
  req: Request<ParamsDictionary, any, any, TSearchParams>,
  res: Response,
) => {
  const { limit, page, query } = req.query;
  const limitNumber = Number(limit);
  const currentPage = Number(page);
  const result = await searchService.simpleSearch({ query, limit: limitNumber, page: currentPage });
  res.status(HttpStatusCode.OK).json({ message: SearchMessage.SEARCH_SUCCESSFULLY, result });
};

export const advancedSearchController = async (
  req: Request<ParamsDictionary, any, any, TSearchParams & TSearchFiltersParams>,
  res: Response,
) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const { query } = req.query || "";
  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  const media_type = req.query.media_type;
  const only_followed_people = req.query.only_followed_people;
  const result = await searchService.advancedSearch({ query, limit, page, user_id, media_type, only_followed_people });
  res.status(HttpStatusCode.OK).json({
    message: SearchMessage.SEARCH_SUCCESSFULLY,
    result: {
      tweets: result.tweets,
      limit,
      page,
      media_type,
      total_page: Math.ceil(result.total / limit),
    },
  });
};
