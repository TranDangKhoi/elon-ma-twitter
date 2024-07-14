import { ParamsDictionary } from "express-serve-static-core";
import { Request, Response } from "express";
import { TBookmarkReqBody, TUnbookmarkReqParams } from "~/models/requests/Bookmark.requests";
import { TokenPayload } from "~/models/requests/User.requests";
import bookmarkServices from "~/services/bookmark.services";
import { BookmarkMessage } from "~/constants/messages.constants";

export const getBookmarksController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const result = await bookmarkServices.getBookmarks(user_id);
  res.status(200).send({
    result,
    message: BookmarkMessage.GET_BOOKMARKS_SUCCESSFULLY,
  });
};

export const createBookmarkController = async (
  req: Request<ParamsDictionary, any, TBookmarkReqBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const { tweet_id } = req.body;
  const result = await bookmarkServices.createBookmark(tweet_id, user_id);
  res.status(200).send({
    result,
    message: BookmarkMessage.BOOKMARK_SUCCESSFULLY,
  });
};

export const removeBookmarkController = async (req: Request<TUnbookmarkReqParams>, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const { tweet_id } = req.params;
  const result = await bookmarkServices.removeBookmark(tweet_id, user_id);
  res.status(200).send({
    result,
    message: BookmarkMessage.UNBOOKMARK_SUCCESSFULLY,
  });
};

export const checkBookmarkController = async (req: Request<TUnbookmarkReqParams>, res: Response) => {
  const { user_id } = req.decoded_access_token as TokenPayload;
  const { tweet_id } = req.params;
  const result = await bookmarkServices.checkBookmark(tweet_id, user_id);
  res.status(200).send({
    result,
    message: BookmarkMessage.CHECK_BOOKMARK_SUCCESSFULLY,
  });
};
