import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";

class UsersServices {
  async register(payload: { email: string; password: string }) {
    const { email, password } = payload;
    const newUser = await databaseService.users.insertOne(
      new User({
        email,
        password,
      }),
    );
    return newUser;
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email });
    console.log(user);
    return Boolean(user);
  }
}

const usersServices = new UsersServices();
export default usersServices;
