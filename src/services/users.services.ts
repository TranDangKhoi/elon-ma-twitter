import { TSignUpReqBody, TUpdateReqBody, TokenPayload } from "~/models/requests/User.requests";
import User from "~/models/schemas/User.schema";
import databaseService from "./database.services";
import { hashPassword } from "~/utils/crypto";
import { signToken, verifyToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import { ObjectId } from "mongodb";
import { config } from "dotenv";
import { FollowMessage, UserMessage } from "~/constants/messages.enum";
import { ErrorWithStatus } from "~/models/Errors";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import Follower from "~/models/schemas/Follower.schema";

config();
class UsersServices {
  private onReject(err: any) {
    console.log(err);
    return err;
  }

  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.ACCESS_TOKEN, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, token_type: TokenType.REFRESH_TOKEN, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      },
    });
  }

  private async signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, verify, token_type: TokenType.EMAIL_VERIFY_TOKEN },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
      },
    });
  }

  private async signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: { user_id, verify, token_type: TokenType.FORGOT_PASSWORD_TOKEN },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        algorithm: "HS256",
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
      },
    });
  }

  private async returnAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return await Promise.all([
      this.signAccessToken({ user_id, verify }).catch(this.onReject),
      this.signRefreshToken({ user_id, verify }).catch(this.onReject),
    ]);
  }

  async signIn({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.returnAccessAndRefreshToken({
      user_id,
      verify,
    });
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, created_at: new Date() }),
    );
    return { access_token, refresh_token };
  }

  async signUp(payload: TSignUpReqBody) {
    const _id = new ObjectId();
    const user_id = _id.toString();
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.UNVERIFIED });
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id,
        email_verify_token,
        username: `user${user_id.toString()}`,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
      }),
    );
    const [access_token, refresh_token] = await this.returnAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.UNVERIFIED,
    });
    if (access_token instanceof Error) {
      console.log(access_token);
    }
    if (refresh_token instanceof Error) {
      console.log(refresh_token);
    }
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, created_at: new Date() }),
    );
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

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    );
    return user;
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      {
        username: username,
      },
      {
        projection: {
          verify: 0,
          email: 0,
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0,
        },
      },
    );
    if (!user) {
      throw new ErrorWithStatus({ message: UserMessage.USER_NOT_FOUND, status: HttpStatusCode.NOT_FOUND });
    }
    return { message: UserMessage.USER_FOUND, user };
  }

  async updateMe(user_id: string, body: TUpdateReqBody) {
    // Ở phần databaseService.users này sẽ có 2 methods là updateOne và findOneAndUpdate
    // updateOne sẽ chỉ update thôi còn không trả ra thông tin cá nhân của user sau khi update
    // còn findOneAndUpdate sẽ update và trả ra thông tin cá nhân của user sau khi update
    const _body = body.date_of_birth ? { ...body, date_of_birth: new Date(body.date_of_birth) } : body;
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id),
      },
      [
        {
          $set: {
            ..._body,
            updated_at: "$$NOW",
          },
        },
      ],
      {
        returnDocument: "after",
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    );
    return user.value;
  }

  async followUser(current_user_id: string, being_followed_user_id: string) {
    const isThisUserFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(current_user_id),
      being_followed_user_id: new ObjectId(being_followed_user_id),
    });
    if (isThisUserFollowed) {
      throw new ErrorWithStatus({ message: UserMessage.USER_ALREADY_FOLLOWED, status: HttpStatusCode.BAD_REQUEST });
    }
    await databaseService.followers.insertOne(
      new Follower({
        _id: new ObjectId(),
        user_id: new ObjectId(current_user_id),
        being_followed_user_id: new ObjectId(being_followed_user_id),
      }),
    );
    const followedUserInfo = await databaseService.users.findOne(
      {
        _id: new ObjectId(being_followed_user_id),
      },
      {
        projection: {
          email: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          password: 0,
          created_at: 0,
        },
      },
    );
    return followedUserInfo;
  }

  async unfollowUser(current_user_id: string, followed_user_id: string) {
    const beingUnfollowedUser = await databaseService.followers.findOneAndDelete({
      user_id: new ObjectId(current_user_id),
      being_followed_user_id: new ObjectId(followed_user_id),
    });
    if (!beingUnfollowedUser.value) {
      throw new ErrorWithStatus({
        message: FollowMessage.NEED_TO_FOLLOW_FIRST,
        status: HttpStatusCode.BAD_REQUEST,
      });
    }
    return beingUnfollowedUser.ok;
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.UNVERIFIED,
    });
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: { email_verify_token, updated_at: "$$NOW" },
      },
    ]);
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.returnAccessAndRefreshToken({
        user_id,
        verify: UserVerifyStatus.VERIFIED,
      }),
      await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: { email_verify_token: "", verify: UserVerifyStatus.VERIFIED, updated_at: "$$NOW" },
        },
      ]),
    ]);
    const [access_token, refresh_token] = token;
    return {
      access_token,
      refresh_token,
    };
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify,
    });
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: { forgot_password_token, updated_at: "$$NOW" },
      },
    ]);
    // Gửi email kèm đường link tới email của user: https://domain.com/forgot-password?token=forgot_password_token
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
  async changePassword(user_id: string, confirm_new_password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id),
      },
      [
        {
          $set: {
            password: hashPassword(confirm_new_password),
            updated_at: "$$NOW",
          },
        },
      ],
    );
  }
  async resetPassword(user_id: string, newPassword: string) {
    const result = await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { password: hashPassword(newPassword), forgot_password_token: "" },
        $currentDate: { updated_at: true },
      },
    );
    return {
      result,
    };
  }
}

const usersServices = new UsersServices();
export default usersServices;
