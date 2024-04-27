export enum UserVerifyStatus {
  UNVERIFIED,
  VERIFIED,
  BANNED,
}

export enum TokenEnum {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  FORGOT_PASSWORD_TOKEN,
  EMAIL_VERIFY_TOKEN,
}

export enum MediaEnum {
  Image = "image",
  Video = "video",
  HLS = "hls",
}

export enum TweetTypeEnum {
  TWEET,
  RETWEET,
  COMMENT,
  QUOTETWEET,
}

export enum TweetAudienceEnum {
  PUBLIC,
  FOLLOWER,
  PRIVATE,
}
