import { Router } from "express";
import { advancedSearchController, simpleSearchController } from "~/controllers/search.controllers";
import { advancedSearchFiltersValidator, searchParamsValidator } from "~/middlewares/search.middlewares";
import { accessTokenValidator } from "~/middlewares/users.middlewares";

const searchRouter = Router();

searchRouter.get(
  "/",
  accessTokenValidator,
  searchParamsValidator,
  advancedSearchFiltersValidator,
  advancedSearchController,
);

// This route is DEPRECATED, its existence is just to show the difference between simple and advanced search
searchRouter.get("/simple-search", accessTokenValidator, simpleSearchController);

export default searchRouter;
