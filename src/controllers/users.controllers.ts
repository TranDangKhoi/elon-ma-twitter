import { Request, Response } from "express";

export const loginController = (req: Request, res: Response) => {
  const user = req.body;
  res.status(201).json({
    message: "User created",
    user: user,
  });
};
