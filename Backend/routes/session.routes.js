

import { Router } from "express";
const sessionsRouter = Router();

sessionsRouter.post('/',CreateSession);
sessionsRouter.get('/',GetSessionsByRole); // query param: role=mentor|student
sessionsRouter.patch('/:id/status',UpdateSessionStatus);

export default sessionsRouter;