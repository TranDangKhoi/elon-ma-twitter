import { TSignUpReqBody, TokenPayload } from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { hashPassword } from "~/utils/crypto";
import { signToken, verifyToken } from "~/utils/jwt";
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

  private async signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: { user_id, token_type: TokenType.FORGOT_PASSWORD_TOKEN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
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

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id);
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: { email_verify_token, updated_at: "$$NOW" },
      },
    ]);
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.returnAccessAndRefreshToken(user_id),
      await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: { email_verify_token: "", verify: UserVerifyStatus.VERIFIED, updated_at: "$$NOW" },
        },
      ]),
    ]);
    const [access_token, refresh_token] = token;
    console.log(access_token, refresh_token);
    return {
      access_token,
      refresh_token,
    };
  }

  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email });
    const userId = user?._id.toString();
    const forgot_password_token = await this.signForgotPasswordToken(userId as string);
    await databaseService.users.updateOne({ _id: new ObjectId(userId) }, [
      {
        $set: { forgot_password_token, updated_at: "$$NOW" },
      },
    ]);
    // Gửi email kèm đường link tới email của user: https://domain.com/forgot-password?token=forgot_password_token
    console.log("forgot_password_token:", forgot_password_token);
    return {
      message: "Đã gửi e-mail xác thực mật khẩu, vui lòng kiểm tra email để tiếp tục",
    };
  }

  async verifyForgotPasswordToken(forgot_password_token: string) {
    // const { user_id } = await verifyToken({
    //   token: forgot_password_token,
    //   secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
    // });
    // Lúc này người dùng mới chỉ verify xem cái forgot_password_token có valid hay không, chứ họ chưa hề đổi mật khẩu mới
    // Vì vậy ta sẽ chưa update lại forgot_password_token thành "" trong db được, phải đợi họ đổi xong mật khẩu mới
    // Không thì nhỡ đâu họ mới click vào link => nhưng chưa change password, sau này muốn click lại thì sẽ không được nữa
    // await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
    //   {
    //     $set: { forgot_password_token: "", updated_at: "$$NOW" },
    //   },
    // ]);
    return {
      token: forgot_password_token,
      message: "Xác thực token thành công",
    };
  }
}

const usersServices = new UsersServices();
export default usersServices;
