import { Router } from "express";
import { GetCurrentUser, UpdateCurrentUser } from "../controllers/user.controller.js";

const userRouter = Router();


userRouter.get("/me", GetCurrentUser);
userRouter.patch('/me', UpdateCurrentUser);




export default userRouter;