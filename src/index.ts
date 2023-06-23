import express from "express";
import usersRouter from "~/routes/users.routes";
import databaseService from "./services/database.services";
const app = express();
const port = 9090;
app.use(express.json());
app.use("/users", usersRouter);

databaseService.connect().catch(console.dir);
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
