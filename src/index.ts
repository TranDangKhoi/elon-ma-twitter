import cors from "cors";
import express from "express";
import { createServer } from "http";
import { ObjectId } from "mongodb";
import { Server } from "socket.io";
import Conversation from "~/models/schemas/Conversation.schema";
import bookmarkRouter from "~/routes/bookmarks.routes";
import conversationRouter from "~/routes/conversations.routes";
import followersRouter from "~/routes/followers.routes";
import likesRouter from "~/routes/likes.routes";
import mediasRouter from "~/routes/medias.routes";
import searchRouter from "~/routes/search.routes";
import tweetsRouter from "~/routes/tweets.routes";
import usersRouter from "~/routes/users.routes";
import { TPrivateChatMessage } from "~/types/chat.types";
import { pinoLog } from "~/utils/dev";
import { VIDEO_UPLOAD_DIR } from "./constants/constants";
import { defaultErrorHandler } from "./middlewares/errors.middlewares";
import databaseService from "./services/database.services";
import { initFolder } from "./utils/file";

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

  // Only proceed if user_id exists (authenticated)
  if (!user_id) {
    console.log("No user_id found, disconnecting socket");
    socket.disconnect();
    return;
  }

  users.set(user_id, socket.id);

  socket.on("send_message", async (data: TPrivateChatMessage) => {
    console.log(data);
    const { message, receiver_id, sender_name } = data;
    const receiver_socket_id = users.get(receiver_id) as string;
    await databaseService.conversations.insertOne(
      new Conversation({
        sender_id: new ObjectId(user_id),
        receiver_id: new ObjectId(receiver_id),
        content: message,
      }),
    );

    socket.emit("receive_message", { message, sender_id: user_id, sender_name });
    // Gửi đến người nhận khác
    socket.to(receiver_socket_id).emit("receive_message", { message, sender_id: user_id, sender_name });
    // }
  });

  socket.on("disconnect", () => {
    users.delete(user_id);
    console.log("User disconnected:", user_id);
    console.log("Remaining users:", users);
  });
});

app.use("/users", usersRouter);
app.use("/tweets", tweetsRouter);
app.use("/medias", mediasRouter);
app.use("/bookmarks", bookmarkRouter);
app.use("/likes", likesRouter);
app.use("/search", searchRouter);
app.use("/follows", followersRouter);
app.use("/conversations", conversationRouter);

// Đây là cách serve video sử dụng express.static, nhưng hiện tại mình sẽ comment nó lại vì mình đang không sử dụng cách có sẵn này
app.use("/medias/video", express.static(VIDEO_UPLOAD_DIR));
app.use(defaultErrorHandler);

httpServer.listen(port, () => {
  pinoLog.info(`Server running on port ${port}`);
});
