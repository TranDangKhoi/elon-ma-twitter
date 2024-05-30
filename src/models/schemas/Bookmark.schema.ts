import { ObjectId } from "mongodb";

type TBookmark = {
  _id?: ObjectId;
  tweet_id: ObjectId;
  user_id: ObjectId;
  created_at?: Date;
  updated_at?: Date;
};

export default class Bookmark {
  _id?: ObjectId;
  tweet_id: ObjectId;
  user_id: ObjectId;
  created_at?: Date;
  updated_at?: Date;

  constructor({ _id, tweet_id, user_id, created_at, updated_at }: TBookmark) {
    this._id = _id || new ObjectId();
    this.tweet_id = tweet_id;
    this.user_id = user_id;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
  }
}
