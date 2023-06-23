import { TSignUpReqBody } from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType } from "~/constants/enums";

class UsersServices {
  private onReject(err: any) {
    console.log(err);
    return err;
  }
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ACCESS_TOKEN },
    });
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.REFRESH_TOKEN },
    });
  }
  async register(payload: TSignUpReqBody) {
    const newUser = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
      }),
    );
    const user_id = newUser.insertedId.toString();
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id).catch(this.onReject),
      this.signRefreshToken(user_id).catch(this.onReject),
    ]);
    if (access_token instanceof Error) {
      console.log(access_token);
    }
    if (refresh_token instanceof Error) {
      console.log(refresh_token);
    }
    return {
      access_token,
      refresh_token,
    };
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email });
    console.log(user);
    return Boolean(user);
  }
}

const usersServices = new UsersServices();
export default usersServices;
