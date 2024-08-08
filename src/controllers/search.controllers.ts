import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { Request, Response } from "express";
export const searchController = (req: Request, res: Response) => {
  res.status(HttpStatusCode.OK).json({ message: `Search controller` });
};
