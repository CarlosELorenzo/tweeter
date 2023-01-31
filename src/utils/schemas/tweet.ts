import { z } from "zod";

export const tweetSchema = z.object({
  content: z
    .string({
      required_error: "Tweet cannot be empty",
    })
    .min(1)
    .max(140),
  parentTweetId: z.string().cuid().nullish(),
});

