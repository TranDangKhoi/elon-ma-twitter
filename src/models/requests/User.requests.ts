import { JwtPayload } from "jsonwebtoken";
import { TokenType } from "~/constants/enums";

export type TUpdateReqBody = {
  name?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
};

export type TLoginReqBody = {
  email: string;
  password: string;
};

export type TSignUpReqBody = {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
};

export type TSignOutReqBody = {
  refresh_token: string;
};

export type TProfileReqParams = {
  username: string;
};

export type TUnfollowedReqParams = {
  being_followed_user_id: string;
};

export type TFollowUserReqBody = {
  being_followed_user_id: string;
};

export type TokenPayload = { user_id: string; token_type: TokenType } & JwtPayload;
