import { Router } from "express";

import { aiRouter } from "./ai.routes.js";
import { analyticsRouter } from "./analytics.routes.js";
import { authRouter } from "./auth.routes.js";
import { channelsRouter } from "./channels.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { postsRouter } from "./posts.routes.js";
import { publicReviewRouter } from "./public-review.routes.js";
import { reviewLinkRouter } from "./review-link.routes.js";
import { reviewsRouter } from "./reviews.routes.js";
import { settingsRouter } from "./settings.routes.js";

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(dashboardRouter);
apiRouter.use(publicReviewRouter);
apiRouter.use(reviewLinkRouter);
apiRouter.use(reviewsRouter);
apiRouter.use(aiRouter);
apiRouter.use(postsRouter);
apiRouter.use(analyticsRouter);
apiRouter.use(channelsRouter);
apiRouter.use(settingsRouter);
