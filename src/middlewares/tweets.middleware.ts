import { NextFunction, Request, Response } from "express";

export const tweetPostValidator = (req: Request, res: Response, next: NextFunction) => {
  console.log("hehe");
};
