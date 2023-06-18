import { Router } from "express";

const userRouter = Router();

userRouter.use((req, res, next) => {
  console.log(`Time: ${Date.now()}`);
  next();
});

userRouter.get("/", (req, res) => {
  res.send("Hello World");
});

export default userRouter;
