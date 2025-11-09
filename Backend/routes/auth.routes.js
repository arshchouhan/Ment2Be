import { Router } from "express";
const authRouter = Router();


authRouter.post('/login',Login);
authRouter.post('/register',Register);
authRouter.post('/logout',Logout);



export default authRouter;