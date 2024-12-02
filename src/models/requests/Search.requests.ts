import { MediaEnum } from "~/constants/enums";

// These are the params that the search requests will receive
export type TSearchParams = {
  query: string;
  limit: string;
  page: string;
  // Because the type of ReqQuery in express is string | string[] | undefined, we can not use boolean for only_followed_people
  // Therefore, I used "true" | "false" instead of boolean
  only_followed_people: "true" | "false";
  media_type: MediaEnum;
};
