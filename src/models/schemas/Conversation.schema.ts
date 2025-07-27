import { ObjectId } from "mongodb";

type TConversation = {
  _id?: ObjectId;
  sender_id: ObjectId;
  receiver_id: ObjectId;
  content: string;
  created_at?: Date;
};

export default class Conversation {
  _id?: ObjectId;
  sender_id: ObjectId;
  receiver_id: ObjectId;
  content: string;
  created_at?: Date;

  constructor({ _id, sender_id, receiver_id, content, created_at }: TConversation) {
    this._id = _id || new ObjectId();
    this.sender_id = sender_id;
    this.receiver_id = receiver_id;
    this.content = content;
    this.created_at = created_at || new Date();
  }
}
