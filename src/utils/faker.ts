import { faker } from "@faker-js/faker";
import { ObjectId, WithId } from "mongodb";
import { MediaEnum, TweetAudienceEnum, TweetTypeEnum, UserVerifyStatus } from "~/constants/enums";
import { TTweetReqBody } from "~/models/requests/Tweet.requests";
import { TSignUpReqBody } from "~/models/requests/User.requests";
import Follower from "~/models/schemas/Follower.schema";
import Hashtag from "~/models/schemas/Hashtag.schema";
import Tweet from "~/models/schemas/Tweet.schema";
import User from "~/models/schemas/User.schema";
import databaseService from "~/services/database.services";
import { hashPassword } from "~/utils/crypto";

// Mật khẩu cho các fake user
const PASSWORD = "Toilaai@123";
// ID của tài khoản của mình, dùng để follow người khác
const MYID = new ObjectId("6686506a9a0035498bb9108e");

// Số lượng user được tạo, mỗi user sẽ mặc định tweet 2 cái
const USER_COUNT = 30;

const createRandomUser = () => {
  const user: TSignUpReqBody = {
    name: faker.internet.displayName(),
    email: faker.internet.email(),
    password: PASSWORD,
    confirm_password: PASSWORD,
    date_of_birth: faker.date.past().toISOString(),
  };
  return user;
};

const createRandomTweet = () => {
  const tweet: TTweetReqBody = {
    type: TweetTypeEnum.TWEET,
    audience: TweetAudienceEnum.EVERYONE,
    content: faker.lorem.paragraph({
      min: 10,
      max: 160,
    }),
    hashtags: ["NodeJS", "MongoDB", "ExpressJS", "Swagger", "Docker", "Socket.io"],
    medias: [
      {
        type: MediaEnum.Image,
        url: faker.image.url(),
      },
    ],
    mentions: [],
    parent_id: null,
  };
  return tweet;
};
const users: TSignUpReqBody[] = faker.helpers.multiple(createRandomUser, {
  count: USER_COUNT,
});

const insertMultipleUsers = async (users: TSignUpReqBody[]) => {
  console.log("Creating users...");
  const result = await Promise.all(
    users.map(async (user) => {
      const user_id = new ObjectId();
      await databaseService.users.insertOne(
        new User({
          ...user,
          _id: user_id,
          username: `user${user_id.toString()}`,
          password: hashPassword(user.password),
          date_of_birth: new Date(user.date_of_birth),
          verify: UserVerifyStatus.VERIFIED,
        }),
      );
      return user_id;
    }),
  );
  console.log(`Created ${result.length} users`);
  return result;
};

const followMultipleUsers = async (user_id: ObjectId, being_followed_user_ids: ObjectId[]) => {
  console.log("Start following...");
  const result = await Promise.all(
    being_followed_user_ids.map((being_followed_user_id) =>
      databaseService.followers.insertOne(
        new Follower({
          user_id,
          being_followed_user_id: new ObjectId(being_followed_user_id),
        }),
      ),
    ),
  );
  console.log(`Followed ${result.length} users`);
};

const checkAndCreateHashtags = async (hashtags: string[]) => {
  const hashtagDocuemts = await Promise.all(
    hashtags.map((hashtag) => {
      // Tìm hashtag trong database, nếu có thì lấy, không thì tạo mới
      return databaseService.hashtags.findOneAndUpdate(
        { name: hashtag },
        {
          $setOnInsert: new Hashtag({ name: hashtag }),
        },
        {
          upsert: true,
          returnDocument: "after",
        },
      );
    }),
  );
  return hashtagDocuemts.map((hashtag) => (hashtag.value as WithId<Hashtag>)._id);
};

const insertTweet = async (user_id: ObjectId, body: TTweetReqBody) => {
  const hashtags = await checkAndCreateHashtags(body.hashtags);
  const result = await databaseService.tweets.insertOne(
    new Tweet({
      audience: body.audience,
      content: body.content,
      hashtags,
      mentions: body.mentions,
      medias: body.medias,
      parent_id: new ObjectId(body.parent_id as string),
      type: body.type,
      user_id: new ObjectId(user_id),
    }),
  );
  return result;
};

const insertMultipleTweets = async (ids: ObjectId[]) => {
  console.log("Creating tweets...");
  let count = 0;
  setTimeout(() => {
    console.log(`Counting...`);
  }, 1500);
  const result = await Promise.all(
    ids.map(async (id, index) => {
      await Promise.all([insertTweet(id, createRandomTweet()), insertTweet(id, createRandomTweet())]);
      count += 2;
      console.log(`Created ${count} tweets`);
    }),
  );
  return result;
};

insertMultipleUsers(users).then((ids) => {
  followMultipleUsers(new ObjectId(MYID), ids).catch((err) => {
    console.error("Error when following users");
    console.log(err);
  });
  insertMultipleTweets(ids).catch((err) => {
    console.error("Error when creating tweets");
    console.log(err);
  });
});
