import { Router } from "express";
const userRouter = Router();


userRouter.get('/me',GetCurrentUser);
userRouter.patch('/me',UpdateCurrentUser);




export default userRouter;