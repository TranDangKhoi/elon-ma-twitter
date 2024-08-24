import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { TSearchQuery } from "~/models/requests/Search.requests";
import searchService from "~/services/search.services";
import { SearchMessage } from "~/constants/messages.constants";
import { TokenPayload } from "~/models/requests/User.requests";

export const simpleSearchController = async (req: Request<ParamsDictionary, any, any, TSearchQuery>, res: Response) => {
  const { limit, page, query } = req.query;
  const limitNumber = Number(limit);
  const currentPage = Number(page);
  const result = await searchService.simpleSearch({ query, limit: limitNumber, page: currentPage });
  res.status(HttpStatusCode.OK).json({ message: SearchMessage.SEARCH_SUCCESSFULLY, result });
};

export const advancedSearchController = async (
  req: Request<ParamsDictionary, any, any, TSearchQuery>,
  res: Response,
) => {
  const { limit, page, query } = req.query;
  const { user_id } = req.decoded_access_token as TokenPayload;
  const limitNumber = Number(limit);
  const currentPage = Number(page);
  const result = await searchService.advancedSearch({ query, limit: limitNumber, page: currentPage, user_id });
  res.status(HttpStatusCode.OK).json({
    message: SearchMessage.SEARCH_SUCCESSFULLY,
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limitNumber),
    },
  });
};
