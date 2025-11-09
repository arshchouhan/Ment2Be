

import { Router } from 'express';

const reviewsRouter = Router();

reviewsRouter.post('/', CreateReviewHandler);
reviewsRouter.get('/', GetReviewsHandler); // query param: mentor=ID

export default reviewsRouter;