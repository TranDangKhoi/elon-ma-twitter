import express from "express";
import userRouter from "./user.routes";
const app = express();

app.use("/api/v1/users", userRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
