import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";

export const getConversationController = async (req: Request<ParamsDictionary, any, any>, res: Response) => {
  res.status(200).send({
    message: "Get conversation successfully",
  });
};
