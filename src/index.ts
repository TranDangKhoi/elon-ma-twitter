import express from "express";
import usersRouter from "./routes/users.routes";
const app = express();
app.use(express.json());
app.use("/users", usersRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
