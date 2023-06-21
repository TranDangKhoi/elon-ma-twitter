import { Request, Response } from "express";
import usersServices from "~/services/users.services";

// Validation chain - Sử dụng cho bản express-validator 6 cho xuống
// export const testController = (req: Request, res: Response) => {
//   const errors = validationResult(req);
//   if (errors.isEmpty()) {
//     return res.status(200).send(`Hello, ${req.query.name}`);
//   }
//   return res.status(400).send({ errors: errors.array() });
// };

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
