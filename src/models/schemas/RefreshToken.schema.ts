import { ObjectId } from "mongodb";
type TRefreshToken = {
  _id?: ObjectId;
  token: string;
  created_at?: Date;
  user_id: ObjectId;
};

export default class RefreshToken {
  _id: ObjectId;
  token: string;
  created_at: Date;
  user_id: ObjectId;
  constructor({ _id, token, created_at, user_id }: TRefreshToken) {
    this._id = _id || new ObjectId();
    this.token = token;
    this.created_at = created_at || new Date();
    this.user_id = user_id;
  }
}
