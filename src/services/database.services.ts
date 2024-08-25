import { Collection, Db, MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import User from "~/models/schemas/User.schema";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import Follower from "~/models/schemas/Follower.schema";
import Tweet from "~/models/schemas/Tweet.schema";
import Hashtag from "~/models/schemas/Hashtag.schema";
import Bookmark from "~/models/schemas/Bookmark.schema";
import Like from "~/models/schemas/Like.schema";
dotenv.config();
const uri = `mongodb+srv://${process.env.CLOUD_DB_USERNAME}:${process.env.CLOUD_DB_PASSWORD}@twittercluster0.wkhc8f0.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

class DatabaseServices {
  private client: MongoClient;
  private db: Db;
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.CLOUD_DB_NAME);
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      this.indexUsers();
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }

  async indexUsers() {
    const indexesExist = await this.users.indexExists(["email_1_password_1", "email_1", "username_1"]);
    if (!indexesExist) {
      this.users.createIndex({ email: 1, password: 1 });
      this.users.createIndex({ email: 1 }, { unique: true });
      this.users.createIndex({ username: 1 }, { unique: true });
      console.log("Indexed users collection");
    }
  }

  async indexRefreshTokens() {
    const indexesExist = await this.refreshTokens.indexExists(["token_1", "exp_1"]);
    if (!indexesExist) {
      this.refreshTokens.createIndex({ token: 1 });
      this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
      console.log("Indexed refresh_tokens collection");
    }
  }

  async indexFollowers() {
    const indexesExist = await this.followers.indexExists(["user_id_1_being_followed_user_id_1"]);
    if (!indexesExist) {
      this.followers.createIndex({ user_id: 1, being_followed_user_id: 1 });
      console.log("Indexed followers collection");
    }
  }

  async indexTweets() {
    const indexesExist = await this.tweets.indexExists(["content_text"]);
    if (!indexesExist) {
      this.tweets.createIndex({ content: "text" }, { default_language: "none" });
      console.log("Indexed tweets collection");
    }
  }

  get users(): Collection<User> {
    return this.db.collection("users");
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection("refresh_tokens");
  }

  get followers(): Collection<Follower> {
    return this.db.collection("followers");
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection("tweets");
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection("hashtags");
  }

  get bookmarks(): Collection<Bookmark> {
    return this.db.collection("bookmarks");
  }

  get likes(): Collection<Like> {
    return this.db.collection("likes");
  }
}

const databaseService = new DatabaseServices();
export default databaseService;
