import { JwtPayload } from "jsonwebtoken";
import { TokenType } from "~/constants/enums";

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

export type TokenPayload = { user_id: string; token_type: TokenType } & JwtPayload;
