import cors from "cors";
import databaseService from "./services/database.services";
import express from "express";
import { defaultErrorHandler } from "./middlewares/errors.middlewares";
import { initFolder } from "./utils/file";
import { VIDEO_UPLOAD_DIR } from "./constants/constants";
import bookmarkRouter from "~/routes/bookmarks.routes";
import likesRouter from "~/routes/likes.routes";
import mediasRouter from "~/routes/medias.routes";
import tweetsRouter from "~/routes/tweets.routes";
import usersRouter from "~/routes/users.routes";
import searchRouter from "~/routes/search.routes";

// ONLY UNCOMMENT THIS LINE IF YOU WANT TO SEED DATA INTO TWEETS AND USERS COLLECTION
// import "~/utils/faker";
databaseService
  .connect()
  .then(() => {
    databaseService.indexUsers();
    databaseService.indexRefreshTokens();
    databaseService.indexFollowers();
    databaseService.indexTweets();
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
app.use("/bookmarks", bookmarkRouter);
app.use("/likes", likesRouter);
app.use("/search", searchRouter);
// Đây là cách serve video sử dụng express.static, nhưng hiện tại mình sẽ comment nó lại vì mình đang không sử dụng cách có sẵn này
app.use("/medias/video", express.static(VIDEO_UPLOAD_DIR));
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
