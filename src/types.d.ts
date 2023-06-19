export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CLOUD_DB_NAME: string;
      CLOUD_DB_USERNAME: string;
      CLOUD_DB_PASSWORD: string;
    }
  }
}
