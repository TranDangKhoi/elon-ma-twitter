import { checkSchema } from "express-validator";
import { MediaEnum } from "~/constants/enums";
import { SearchMessage } from "~/constants/messages.constants";
import { validate } from "~/utils/validation";

export const searchParamsValidator = validate(
  checkSchema(
    {
      query: {
        isString: {
          errorMessage: SearchMessage.SEARCH_QUERY_IS_REQUIRED,
        },
      },
      limit: {
        optional: true,
        isInt: {
          errorMessage: SearchMessage.SEARCH_LIMIT_MUST_BE_A_NUMBER,
        },
      },
      page: {
        optional: true,
        isInt: {
          errorMessage: SearchMessage.SEARCH_PAGE_MUST_BE_A_NUMBER,
        },
      },
    },
    ["query"],
  ),
);

export const advancedSearchFiltersValidator = validate(
  checkSchema(
    {
      media_type: {
        optional: true,
        isString: {
          errorMessage: SearchMessage.SEARCH_MEDIA_TYPE_MUST_BE_A_STRING,
        },
        isIn: {
          options: [Object.values(MediaEnum)],
          errorMessage: SearchMessage.SEARCH_MEDIA_TYPE_MUST_BE_VALID,
        },
      },
      only_followed_people: {
        optional: true,
        // Mặc dù ta để validation là isBoolean nhưng express-validator cũng sẽ convert từ "true" sang true và "false" sang false
        // Vậy nên isBoolean works perfectly
        isBoolean: true,
        errorMessage: SearchMessage.SEARCH_ONLY_FOLLOWED_PEOPLE_MUST_BE_A_BOOLEAN,
      },
    },
    ["query"],
  ),
);
