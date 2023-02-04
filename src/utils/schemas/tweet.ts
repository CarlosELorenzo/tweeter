import { TweetListType } from "@utils/api/tweet/requests";
import { z } from "zod";

export const createTweetSchema = z.object({
  content: z
    .string({
      required_error: "Tweet cannot be empty",
    })
    .min(1)
    .max(140),
  parentTweetId: z.string().cuid().nullish(),
  privateReply: z.boolean().default(false),
  image: z.string().url().nullish(),
});

export const getTweetSchema = z.object({
  id: z.string().cuid(),
});

export const tweetActionSchema = z.object({
  tweetId: z
    .string({
      required_error: "Tweet ID is required",
    })
    .cuid(),
});

export const listTweetSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(10),
  userId: z.string().nullish(),
  type: z.nativeEnum(TweetListType).default(TweetListType.EXPLORE),
});
