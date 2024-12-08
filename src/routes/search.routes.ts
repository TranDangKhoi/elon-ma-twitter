import { Router } from "express";
import { advancedSearchController, simpleSearchController } from "~/controllers/search.controllers";
import { accessTokenValidator } from "~/middlewares/users.middlewares";

const searchRouter = Router();

searchRouter.get("/", accessTokenValidator, advancedSearchController);

// This route is deprecated, just to show the difference between simple and advanced search
searchRouter.get("/simple-search", accessTokenValidator, simpleSearchController);

export default searchRouter;
