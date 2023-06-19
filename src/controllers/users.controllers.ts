import { Request, Response } from "express";
import User from "~/models/schemas/User.schema";
import databaseService from "~/services/database.services";
import usersServices from "~/services/users.services";

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;
  res.status(201).json({
    message: "Login successfully",
    user: {
      email,
      password,
    },
  });
};

export const registerController = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await usersServices.register({ email, password });
    res.status(201).json({
      message: "Register successfully",
      result,
    });
  } catch (error) {
    res.status(400).json({
      status: "Fail",
      message: error,
    });
  }
};
