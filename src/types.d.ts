import User from "./models/schemas/User.schema";

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLOUD_DB_NAME: string;
      CLOUD_DB_USERNAME: string;
      CLOUD_DB_PASSWORD: string;
      PASSWORD_SECRET: string;
      JWT_SECRET: string;
      ACCESS_TOKEN_EXPIRES_IN: string;
      REFRESH_TOKEN_EXPIRES_IN: string;
    }
  }
}

declare module "express" {
  interface Request {
    user?: User;
  }
}
