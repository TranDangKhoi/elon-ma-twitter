import { Router } from "express";
import { loginValidator } from "~/middlewares/users.middleware";

const usersRouter = Router();

usersRouter.get("/", (req, res) => {
  res.send("Hello World");
});

usersRouter.post("/", loginValidator, (req, res) => {
  const user = req.body;
  res.status(201).json({
    message: "User created",
    user: user,
  });
});

export default usersRouter;
