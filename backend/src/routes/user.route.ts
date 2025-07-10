import { Router } from "express";
import { getUserDetails } from "../controllers/userController";
import { verifyAuth } from "../middlewares/verifyAuthMiddleware";
import { attachAccessTokenToRes } from "../utils/attachAccessTokenToRes";

const userRouter = Router();

userRouter.get(
  "/get/details",
  verifyAuth,
  attachAccessTokenToRes(getUserDetails)
);

export default userRouter;
