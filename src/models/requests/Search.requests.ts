import { MediaEnum } from "~/constants/enums";

export type TSearchQuery = {
  query: string;
  limit: string;
  page: string;
  media_type: MediaEnum;
};
