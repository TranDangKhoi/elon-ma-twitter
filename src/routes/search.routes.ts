import { Router } from "express";
import { searchController } from "~/controllers/search.controllers";

const searchRouter = Router();

searchRouter.get("/", searchController);
export default searchRouter;
