import { Router } from "express";
import { googleAuth, logout } from "../controllers/authController";
import { verifyAuth } from "../middlewares/verifyAuthMiddleware";

const authRouter = Router();

authRouter.post("/google", googleAuth);

authRouter.get("/logout", verifyAuth, logout);

export default authRouter;
