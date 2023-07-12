import { TSignUpReqBody } from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import { ObjectId } from "mongodb";
import { config } from "dotenv";

config();
class UsersServices {
  private onReject(err: any) {
    console.log(err);
    return err;
  }
  private signAccessToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.ACCESS_TOKEN },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      },
    });
  }
  private signRefreshToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.REFRESH_TOKEN },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      },
    });
  }
  private async signEmailVerifyToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.EMAIL_VERIFY_TOKEN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
      },
    });
  }
  private async returnAccessAndRefreshToken(user_id: string) {
    return await Promise.all([
      this.signAccessToken(user_id).catch(this.onReject),
      this.signRefreshToken(user_id).catch(this.onReject),
    ]);
  }
  async signIn(user_id: string) {
    const [access_token, refresh_token] = await this.returnAccessAndRefreshToken(user_id as string);
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, created_at: new Date() }),
    );
    return { access_token, refresh_token };
  }
  async signUp(payload: TSignUpReqBody) {
    const _id = new ObjectId();
    const user_id = _id.toString();
    const email_verify_token = await this.signEmailVerifyToken(user_id);
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
      }),
    );
    const [access_token, refresh_token] = await this.returnAccessAndRefreshToken(user_id);
    if (access_token instanceof Error) {
      console.log(access_token);
    }
    if (refresh_token instanceof Error) {
      console.log(refresh_token);
    }
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, created_at: new Date() }),
    );
    console.log("email_verify_token", email_verify_token);
    return {
      access_token,
      refresh_token,
    };
  }
  async signOut(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token });
    return {
      message: "Đăng xuất thành công",
    };
  }
  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email });
    return Boolean(user);
  }

  async checkPassword(password: string) {
    const user = await databaseService.users.findOne({ password: hashPassword(password) });
    return Boolean(user);
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.returnAccessAndRefreshToken(user_id),
      await databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: { email_verify_token: "", updated_at: new Date(), verify: UserVerifyStatus.VERIFIED } },
      ),
    ]);
    const [access_token, refresh_token] = token;
    console.log(access_token, refresh_token);
    return {
      access_token,
      refresh_token,
    };
  }
}

const usersServices = new UsersServices();
export default usersServices;
