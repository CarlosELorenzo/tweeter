import {
  createTweet,
  interactionHandler,
  InteractionType,
  list,
} from "@utils/api/tweet";
import {
  listTweetSchema,
  tweetActionSchema,
  tweetSchema,
} from "@utils/schemas/tweet";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure.input(tweetSchema).mutation(createTweet),

  list: publicProcedure.input(listTweetSchema).query(list),
  retweet: protectedProcedure
    .input(tweetActionSchema)
    .mutation(async (inputs) => {
      await interactionHandler(inputs, InteractionType.RETWEET);
    }),
  save: protectedProcedure.input(tweetActionSchema).mutation(async (inputs) => {
    await interactionHandler(inputs, InteractionType.SAVE);
  }),
  like: protectedProcedure.input(tweetActionSchema).mutation(async (inputs) => {
    await interactionHandler(inputs, InteractionType.LIKE);
  }),
});
