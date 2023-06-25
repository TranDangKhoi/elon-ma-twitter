import { Router } from "express";
import { query } from "express-validator";
import { loginController, registerController } from "~/controllers/users.controllers";
import { loginValidator, registerValidator } from "~/middlewares/users.middleware";
import { wrapRequestHandler } from "~/utils/handlers";

const usersRouter = Router();

usersRouter.post("/login", loginValidator, loginController);
/**
 * Description: Register a new user
 * Path: /register
 * Method: POST
 * Body: {
 * name: string
 * email: string,
 * password: string
 * confirm_password: string
 * dob: ISO 8601
 * }
 */
usersRouter.post("/signup", registerValidator, wrapRequestHandler(registerController));

export default usersRouter;
