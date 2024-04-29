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
