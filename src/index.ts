import cors from "cors";
import express from "express";
import mediasRouter from "~/routes/medias.routes";
import tweetsRouter from "~/routes/tweets.routes";
import usersRouter from "~/routes/users.routes";
import { VIDEO_UPLOAD_DIR } from "./constants/constants";
import { defaultErrorHandler } from "./middlewares/errors.middlewares";
import databaseService from "./services/database.services";
import { initFolder } from "./utils/file";

databaseService
  .connect()
  .then(() => {
    databaseService.indexUsers();
    databaseService.indexRefreshTokens();
    databaseService.indexFollowers();
  })
  .catch(console.dir);
initFolder();
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());
app.use("/users", usersRouter);
app.use("/tweets", tweetsRouter);
app.use("/medias", mediasRouter);
// Đây là cách serve video sử dụng express.static, nhưng hiện tại mình sẽ comment nó lại vì mình đang không sử dụng cách có sẵn này
app.use("/medias/video", express.static(VIDEO_UPLOAD_DIR));
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
