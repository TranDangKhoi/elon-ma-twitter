import { ObjectId } from "mongodb";

type TFollowers = {
  _id?: ObjectId;
  user_id: ObjectId;
  being_followed_user_id: ObjectId;
  created_at?: Date;
};

export default class Follower {
  _id?: ObjectId;
  user_id: ObjectId;
  being_followed_user_id: ObjectId;
  created_at?: Date;
  constructor({ _id, being_followed_user_id, user_id, created_at }: TFollowers) {
    this._id = _id || new ObjectId();
    this.user_id = user_id;
    this.being_followed_user_id = being_followed_user_id;
    this.created_at = created_at || new Date();
  }
}
