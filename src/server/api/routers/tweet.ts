import {
  createTweet,
  interactionHandler,
  InteractionType,
  list,
  get,
} from "@utils/api/tweet";
import {
  listTweetSchema,
  tweetActionSchema,
  createTweetSchema,
  getTweetSchema,
} from "@utils/schemas/tweet";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure.input(createTweetSchema).mutation(createTweet),
  get: publicProcedure.input(getTweetSchema).query(get),
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
