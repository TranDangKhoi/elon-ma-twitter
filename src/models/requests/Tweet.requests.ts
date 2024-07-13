import { ParamsDictionary, Query } from "express-serve-static-core";
import { TweetAudienceEnum, TweetTypeEnum } from "~/constants/enums";
import { TMediaResponse } from "~/types/media.types";

export type TTweetReqBody = {
  type: TweetTypeEnum;
  audience: TweetAudienceEnum;
  content: string;
  parent_id: null | string;
  hashtags: string[];
  mentions: string[];
  medias: TMediaResponse[];
};

export type TTweetParams = {
  tweet_id: string;
} & ParamsDictionary;

export type TTweetQuery = {
  limit: string;
  page: string;
  tweet_type: string;
} & Query;
