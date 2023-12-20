export enum UserVerifyStatus {
  UNVERIFIED,
  VERIFIED,
  BANNED,
}

export enum TokenType {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  FORGOT_PASSWORD_TOKEN,
  EMAIL_VERIFY_TOKEN,
}

export enum MediaType {
  Image = "image",
  Video = "video",
  HLS = "hls",
}
