import { createTweet } from "../../../utils/api/tweet";
import { tweetSchema } from "../../../utils/schemas/tweet";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(tweetSchema)
    .mutation(async ({ ctx, input }) => {
      await createTweet(ctx, input);
    }),
});
