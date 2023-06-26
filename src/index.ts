import express from "express";
import usersRouter from "~/routes/users.routes";
import { defaultErrorHandler } from "./middlewares/errors.middlewares";
import databaseService from "./services/database.services";
databaseService.connect().catch(console.dir);
const app = express();
const port = 9090;
app.use(express.json());
app.use("/users", usersRouter);
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
