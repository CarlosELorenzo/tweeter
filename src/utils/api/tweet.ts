import type { TrpcContext } from "./helpers";
import { RouterInputs } from "../api";

export const createTweet = async (
  ctx: TrpcContext,
  input: RouterInputs["tweet"]["create"]
) => {
  const { prisma, session } = ctx;
  const { content, parentTweetId } = input;
  const tweet = await prisma.tweet.create({
    data: {
      content,
      author: {
        connect: {
          id: session?.user?.id,
        },
      },
      parent: parentTweetId
        ? {
            connect: {
              id: parentTweetId,
            },
          }
        : undefined,
    },
  });
  return tweet;
};
