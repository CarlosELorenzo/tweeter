import { createTRPCRouter } from "./trpc";
import { tweetRouter } from "./routers/tweet";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  tweet: tweetRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
