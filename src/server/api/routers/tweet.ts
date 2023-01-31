import {
  createTweet,
  isRetweeted,
  retweet,
  unRetweet,
} from "../../../utils/api/tweet";
import { tweetActionSchema, tweetSchema } from "../../../utils/schemas/tweet";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(tweetSchema)
    .mutation(async ({ ctx, input }) => {
      await createTweet(ctx, input);
    }),
  retweet: protectedProcedure
    .input(tweetActionSchema)
    .mutation(async ({ ctx, input }) => {
      if (await isRetweeted(ctx, input)) await unRetweet(ctx, input);
      else await retweet(ctx, input);
    }),
});
