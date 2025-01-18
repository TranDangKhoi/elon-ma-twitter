import cors from "cors";
import databaseService from "./services/database.services";
import express from "express";
import pinoHttp from "pino-http";
import { createServer } from "http";
import { defaultErrorHandler } from "./middlewares/errors.middlewares";
import { initFolder } from "./utils/file";
import { Server } from "socket.io";
import { VIDEO_UPLOAD_DIR } from "./constants/constants";
import bookmarkRouter from "~/routes/bookmarks.routes";
import followersRouter from "~/routes/followers.routes";
import likesRouter from "~/routes/likes.routes";
import mediasRouter from "~/routes/medias.routes";
import searchRouter from "~/routes/search.routes";
import tweetsRouter from "~/routes/tweets.routes";
import usersRouter from "~/routes/users.routes";
import { pinoLog } from "~/utils/dev";

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
app.use(pinoHttp({ logger: pinoLog }));
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    // credentials: true,
  },
});
const users = new Map<string, string>();
io.on("connection", (socket) => {
  const user_id = socket.handshake.auth._id;
  users.set(user_id, socket.id);
  socket.on("disconnect", () => {
    users.delete(user_id);
  });
  pinoLog.info({ map: users });
});

app.use("/users", usersRouter);
app.use("/tweets", tweetsRouter);
app.use("/medias", mediasRouter);
app.use("/bookmarks", bookmarkRouter);
app.use("/likes", likesRouter);
app.use("/search", searchRouter);
app.use("/follows", followersRouter);

// Đây là cách serve video sử dụng express.static, nhưng hiện tại mình sẽ comment nó lại vì mình đang không sử dụng cách có sẵn này
app.use("/medias/video", express.static(VIDEO_UPLOAD_DIR));
app.use(defaultErrorHandler);

httpServer.listen(port, () => {
  pinoLog.info(`Server running on port ${port}`);
});
