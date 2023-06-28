import { Collection, Db, MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import User from "~/models/schemas/User.schema";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
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
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }

  get users(): Collection<User> {
    return this.db.collection("users");
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection("refresh_tokens");
  }
}

const databaseService = new DatabaseServices();
export default databaseService;
