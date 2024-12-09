import { ObjectId } from "mongodb";
import { UserVerifyStatus } from "~/constants/enums";
import { HttpStatusCode } from "~/constants/httpStatusCode.enum";
import { FollowMessage, UserMessage } from "~/constants/messages.constants";
import { ErrorWithStatus } from "~/models/Errors";
import Follower from "~/models/schemas/Follower.schema";
import databaseService from "./database.services";

class FollowersService {
  async meFollowersAggregate({
    query,
    limit,
    page,
    user_id,
  }: {
    query: string;
    limit: number;
    page: number;
    user_id: string;
  }) {
    const $matchStageConditions: {
      being_followed_user_id: ObjectId;
      $text?: { $search: string };
    } = {
      being_followed_user_id: new ObjectId(user_id),
    };

    if (query) {
      $matchStageConditions["$text"] = {
        $search: query,
      };
    }

    return await databaseService.followers
      .aggregate([
        {
          $match: $matchStageConditions,
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "followers",
          },
        },
        {
          $match: {
            "followers.verify": UserVerifyStatus.VERIFIED,
          },
        },
        {
          $project: {
            followers: {
              password: 0,
              forgot_password_token: 0,
              twitter_circle: 0,
              email_verify_token: 0,
            },
          },
        },
        {
          $skip: limit * (page - 1),
        },
        {
          $limit: limit,
        },
      ])
      .toArray();
  }

  async calculateTotalFollowersAggregate({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const $matchStageConditions: {
      being_followed_user_id: ObjectId;
    } = {
      being_followed_user_id: new ObjectId(user_id),
    };

    const total = await databaseService.followers
      .aggregate([
        {
          $match: $matchStageConditions,
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "followers",
          },
        },
        {
          $match: {
            "followers.verify": UserVerifyStatus.VERIFIED,
          },
        },
        {
          $project: {
            followers: {
              password: 0,
              forgot_password_token: 0,
              twitter_circle: 0,
              email_verify_token: 0,
            },
          },
        },
        {
          $count: "total",
        },
      ])
      .toArray();

    if (total.length === 0) {
      return [{ total: 0 }];
    }

    return total;
  }

  async getMeFollowers({
    query,
    limit,
    page,
    user_id,
  }: {
    query: string;
    limit: number;
    page: number;
    user_id: string;
  }) {
    const [followers, total] = await Promise.all([
      this.meFollowersAggregate({
        limit,
        page,
        query,
        user_id,
      }),
      this.calculateTotalFollowersAggregate({
        user_id,
        limit,
        page,
      }),
    ]);
    console.log(total);

    return {
      followers,
      total: total[0].total,
    };
  }
  async getTotalFollowers({ user_id }: { user_id: string }) {
    const totalFollowers = await databaseService.followers.countDocuments({
      being_followed_user_id: new ObjectId(user_id),
    });
    return totalFollowers;
  }

  async getMeFollowing({
    query,
    limit,
    page,
    user_id,
  }: {
    query: string;
    limit: number;
    page: number;
    user_id: string;
  }) {
    const $matchStageConditions: {
      user_id: ObjectId;
      $text?: { $search: string };
    } = {
      user_id: new ObjectId(user_id),
    };

    if (query) {
      $matchStageConditions["$text"] = {
        $search: query,
      };
    }

    const following = await databaseService.followers
      .aggregate([
        {
          $match: $matchStageConditions,
        },
        {
          $lookup: {
            from: "users",
            localField: "being_followed_user_id",
            foreignField: "_id",
            as: "following",
          },
        },
        {
          $match: {
            "following.verify": UserVerifyStatus.VERIFIED,
          },
        },
        {
          $project: {
            following: {
              password: 0,
              forgot_password_token: 0,
              twitter_circle: 0,
              email_verify_token: 0,
            },
          },
        },
        {
          $skip: limit * (page - 1),
        },
        {
          $limit: limit,
        },
      ])
      .toArray();
    return following;
  }

  async followUser(current_user_id: string, being_followed_user_id: string) {
    const isThisUserFollowed = await databaseService.followers.findOne({
      user_id: new ObjectId(current_user_id),
      being_followed_user_id: new ObjectId(being_followed_user_id),
    });
    if (isThisUserFollowed) {
      throw new ErrorWithStatus({ message: UserMessage.USER_ALREADY_FOLLOWED, status: HttpStatusCode.BAD_REQUEST });
    }
    await databaseService.followers.insertOne(
      new Follower({
        _id: new ObjectId(),
        user_id: new ObjectId(current_user_id),
        being_followed_user_id: new ObjectId(being_followed_user_id),
      }),
    );
    const followedUserInfo = await databaseService.users.findOne(
      {
        _id: new ObjectId(being_followed_user_id),
      },
      {
        projection: {
          email: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          password: 0,
          created_at: 0,
        },
      },
    );
    return followedUserInfo;
  }

  async unfollowUser(current_user_id: string, followed_user_id: string) {
    const beingUnfollowedUser = await databaseService.followers.findOneAndDelete({
      user_id: new ObjectId(current_user_id),
      being_followed_user_id: new ObjectId(followed_user_id),
    });
    if (!beingUnfollowedUser.value) {
      throw new ErrorWithStatus({
        message: FollowMessage.NEED_TO_FOLLOW_FIRST,
        status: HttpStatusCode.BAD_REQUEST,
      });
    }
    return beingUnfollowedUser.ok;
  }
}

const followersService = new FollowersService();
export default followersService;
