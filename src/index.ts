import express from "express";
import usersRouter from "~/routes/users.routes";
import databaseService from "./services/database.services";
const app = express();
app.use(express.json());
app.use("/users", usersRouter);

databaseService.connect().catch(console.dir);
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
