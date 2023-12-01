import { TokenPayload } from "./models/requests/User.requests";
import User from "./models/schemas/User.schema";

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLOUD_DB_NAME: string;
      CLOUD_DB_USERNAME: string;
      CLOUD_DB_PASSWORD: string;
      PASSWORD_SECRET: string;
      JWT_SECRET_ACCESS_TOKEN: string;
      JWT_SECRET_REFRESH_TOKEN: string;
      JWT_SECRET_EMAIL_VERIFY_TOKEN: string;
      JWT_SECRET_FORGOT_PASSWORD_TOKEN: string;
      GOOGLE_OAUTH_CLIENT_ID: string;
      GOOGLE_OAUTH_CLIENT_SECRET: string;
      GOOGLE_OAUTH_REDIRECT_URI: string;
      GOOGLE_OAUTH_CLIENT_REDIRECT_URI: string;
      ACCESS_TOKEN_EXPIRES_IN: string;
      REFRESH_TOKEN_EXPIRES_IN: string;
      EMAIL_VERIFY_TOKEN_EXPIRES_IN: string;
      FORGOT_PASSWORD_TOKEN_EXPIRES_IN: string;
    }
  }
}

declare module "express" {
  interface Request {
    user?: User;
    decoded_access_token?: TokenPayload;
    decoded_refresh_token?: TokenPayload;
    decoded_email_verify_token?: TokenPayload;
    decoded_forgot_password_token?: TokenPayload;
  }
}
