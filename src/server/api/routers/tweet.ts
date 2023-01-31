import {
  createTweet,
  isLiked,
  isRetweeted,
  isSaved,
  like,
  retweet,
  save,
  unLike,
  unRetweet,
  unSave,
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
  save: protectedProcedure
    .input(tweetActionSchema)
    .mutation(async ({ ctx, input }) => {
      if (await isSaved(ctx, input)) await unSave(ctx, input);
      else await save(ctx, input);
    }),
  like: protectedProcedure
    .input(tweetActionSchema)
    .mutation(async ({ ctx, input }) => {
      if (await isLiked(ctx, input)) await unLike(ctx, input);
      else await like(ctx, input);
    }),
});
