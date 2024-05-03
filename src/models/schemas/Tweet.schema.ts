import { ObjectId } from "mongodb";
import { MediaEnum as MediaEnum, TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import { TMediaResponse } from "~/types/media.types";

// Documentation: Filename: database-design.md, Line 143

type TTweet = {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetTypeEnum;
  // audience: TAudience;
  audience: any;
  content: string;
  parent_id: null | string; //  chỉ null khi tweet gốc
  hashtags: ObjectId[]; // Vì twitter không phân biệt hashtags viết chữ thường với hoa nên hashtags ta sẽ lưu ở dạng ObjectId[] chứ không phải string[]
  mentions: string[];
  medias: TMediaResponse[];
  guest_views: number;
  user_views: number;
  created_at?: Date;
  updated_at?: Date;
};

export default class Tweet {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetTypeEnum;
  audience: TweetAudienceEnum;
  content: string;
  parent_id: null | ObjectId;
  hashtags?: ObjectId[];
  mentions?: ObjectId[];
  medias?: TMediaResponse[];
  guest_views?: number;
  user_views?: number;
  created_at?: Date;
  updated_at?: Date;
  constructor({
    _id,
    user_id,
    type,
    audience,
    content,
    parent_id,
    hashtags,
    mentions,
    medias,
    guest_views,
    user_views,
    created_at,
    updated_at,
  }: TTweet) {
    this._id = _id || new ObjectId();
    this.user_id = user_id;
    this.type = type;
    this.audience = audience;
    this.content = content;
    this.parent_id = parent_id ? new ObjectId(parent_id) : null;
    this.hashtags = hashtags || [];
    this.mentions = mentions.map((mention) => new ObjectId(mention)) || [];
    this.medias = medias || [];
    this.guest_views = guest_views || 0;
    this.user_views = user_views || 0;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }
}
