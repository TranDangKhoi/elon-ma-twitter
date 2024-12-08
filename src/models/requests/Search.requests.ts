import { MediaEnum } from "~/constants/enums";

// These are all the basic/common params that any search requests will receive
// Including: Get followers, users, tweets, etc...
export type TSearchParams = {
  query: string;
  limit: string;
  page: string;
};

// This is the type of the params that the advanced search request will receive
export type TSearchFiltersParams = {
  // Because the type of ReqQuery in express is string | string[] | undefined, we can not use boolean for only_followed_people
  // Therefore, I used "true" | "false" instead of boolean
  only_followed_people: "true" | "false";
  media_type: MediaEnum;
};
