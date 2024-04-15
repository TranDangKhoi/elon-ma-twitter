import { Collection, Db, MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import User from "~/models/schemas/User.schema";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import Follower from "~/models/schemas/Follower.schema";
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

  indexUsers() {
    this.users.createIndex({ email: 1, password: 1 });
    this.users.createIndex({ email: 1 }, { unique: true });
    this.users.createIndex({ username: 1 }, { unique: true });
    console.log("Indexed users collection");
  }

  indexRefreshTokens() {
    this.refreshTokens.createIndex({ token: 1 });
    this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
    console.log("Indexed refresh_tokens collection");
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
}

const databaseService = new DatabaseServices();
export default databaseService;
