import { NextFunction, Request, Response } from "express";
import usersRouters from "../routes/users.routes";
const currentDate = new Date();

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Missing email or password");
  }
  next();
};
