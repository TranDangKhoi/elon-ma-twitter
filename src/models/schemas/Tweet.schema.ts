import { ObjectId } from "mongodb";
import { MediaEnum as MediaEnum } from "~/constants/enums";

type TTweet = {
  _id: ObjectId;
  user_id: ObjectId;
  type: TTweet;
  // audience: TAudience;
  audience: any;
  content: string;
  parent_id: null | ObjectId; //  chỉ null khi tweet gốc
  hashtags: ObjectId[]; // Vì twitter không phân biệt hashtags viết chữ thường với hoa nên hashtags ta sẽ lưu ở dạng ObjectId[] chứ không phải string[]
  mentions: ObjectId[];
  medias: MediaEnum[];
  guest_views: number;
  user_views: number;
  created_at: Date;
  updated_at: Date;
};

export default class Tweet {
  _id: ObjectId;
  user_id: ObjectId;
  type: TTweet;
  audience: any;
  content: string;
  parent_id: null | ObjectId;
  hashtags: ObjectId[];
  mentions: ObjectId[];
  medias: any;
  guest_views: number;
  user_views: number;
  created_at: Date;
  updated_at: Date;
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
    this._id = _id;
    this.user_id = user_id;
    this.type = type;
    this.audience = audience;
    this.content = content;
    this.parent_id = parent_id;
    this.hashtags = hashtags;
    this.mentions = mentions;
    this.medias = medias;
    this.guest_views = guest_views;
    this.user_views = user_views;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
