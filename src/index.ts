import express from "express";
import cors from "cors";
import usersRouter from "~/routes/users.routes";
import mediasRouter from "~/routes/medias.routes";
import { defaultErrorHandler } from "./middlewares/errors.middlewares";
import databaseService from "./services/database.services";
import { initFolder } from "./utils/file";
databaseService.connect().catch(console.dir);
initFolder();
const app = express();
const port = 8080;
app.use(cors());
app.use(express.json());
app.use("/users", usersRouter);
app.use("/medias", mediasRouter);
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
