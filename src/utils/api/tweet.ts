import type { TrpcContext } from "./helpers";
import type { RouterInputs } from "../api";

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

export const retweet = async (
  ctx: TrpcContext,
  input: RouterInputs["tweet"]["retweet"]
) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  const retweet = await prisma.retweet.create({
    data: {
      tweet: {
        connect: {
          id: tweetId,
        },
      },
      author: {
        connect: {
          id: userId,
        },
      },
    },
  });
  return retweet;
};

export const isRetweeted = async (
  ctx: TrpcContext,
  input: RouterInputs["tweet"]["retweet"]
) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  return !!(await prisma.retweet.findFirst({
    where: {
      tweetId,
      authorId: userId,
    },
  }));
};

export const unRetweet = async (
  ctx: TrpcContext,
  input: RouterInputs["tweet"]["retweet"]
) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  const deleteRetweet = await prisma.retweet.deleteMany({
    where: {
      tweetId,
      authorId: userId,
    },
  });
  return deleteRetweet;
};
