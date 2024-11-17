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

// NOTE: Actually Video and HLS is the same, but in this code, I seperate them for learning purpose
// So, we can see how to handle different media type
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
  EVERYONE,
  TWITTERCIRCLE,
  PRIVATE,
}
