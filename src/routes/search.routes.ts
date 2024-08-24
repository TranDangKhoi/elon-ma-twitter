import { Router } from "express";
import { simpleSearchController } from "~/controllers/search.controllers";

const searchRouter = Router();

searchRouter.get("/", simpleSearchController);
export default searchRouter;
