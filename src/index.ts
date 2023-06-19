import express from "express";
import dotenv from "dotenv";
dotenv.config();
import usersRouter from "~/routes/users.routes";
import databaseService from "./services/database.services";
const app = express();
app.use(express.json());
app.use("/users", usersRouter);
console.log(process.env.CLOUD_DB_USERNAME);
databaseService.connect().catch(console.dir);
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
