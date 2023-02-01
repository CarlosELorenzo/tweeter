import type { TrpcContext } from "./helpers";
import type { z } from "zod";
import type {
  listTweetSchema,
  tweetActionSchema,
  tweetSchema,
} from "../schemas/tweet";

type CreateTweetInput = {
  ctx: TrpcContext;
  input: z.infer<typeof tweetSchema>;
};


type TweetActionInput = {
  ctx: TrpcContext;
  input: z.infer<typeof tweetActionSchema>;
};

export const createTweet = async ({ ctx, input }: CreateTweetInput) => {
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

export const isRetweeted = async ({
  ctx,
  input,
}: TweetActionInput): Promise<boolean> => {
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

export const unRetweet = async ({ ctx, input }: TweetActionInput) => {
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

export const save = async ({ ctx, input }: TweetActionInput) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  const save = await prisma.savedTweet.create({
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
  return save;
};

export const isSaved = async ({ ctx, input }: TweetActionInput) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  return !!(await prisma.savedTweet.findFirst({
    where: {
      tweetId,
      authorId: userId,
    },
  }));
};

export const unSave = async ({ ctx, input }: TweetActionInput) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  const deleteSave = await prisma.savedTweet.deleteMany({
    where: {
      tweetId,
      authorId: userId,
    },
  });
  return deleteSave;
};

export const like = async ({ ctx, input }: TweetActionInput) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  const like = await prisma.like.create({
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
  return like;
};

export const isLiked = async ({ ctx, input }: TweetActionInput) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  return !!(await prisma.like.findFirst({
    where: {
      tweetId,
      authorId: userId,
    },
  }));
};

export const unLike = async ({ ctx, input }: TweetActionInput) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;
  const userId = session?.user?.id;
  const deleteLike = await prisma.like.deleteMany({
    where: {
      tweetId,
      authorId: userId,
    },
  });
  return deleteLike;
};
