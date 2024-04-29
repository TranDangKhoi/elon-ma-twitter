import { Request, Response } from "express";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";

export const createTweetController = async (req: Request, res: Response) => {
  res.status(HttpStatusCode.OK).json({
    message: "Create tweet successfully",
  });
};
