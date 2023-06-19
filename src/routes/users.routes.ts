import { Router } from "express";
import { loginController } from "~/controllers/users.controllers";
import { loginValidator } from "~/middlewares/users.middleware";

const usersRouter = Router();

usersRouter.get("/", (req, res) => {
  res.send("Hello World");
});

usersRouter.post("/", loginValidator, loginController);

export default usersRouter;
