/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { TrpcContext } from "../helpers";
import type { z } from "zod";
import type {
  listTweetSchema,
  tweetActionSchema,
  createTweetSchema,
  getTweetSchema,
} from "../../schemas/tweet";
import {
  createTweetRequest,
  getInteractionRequest,
  getTweetListRequest,
  getTweetRequest,
} from "./requests";

type CreateTweetInput = {
  ctx: TrpcContext;
  input: z.infer<typeof createTweetSchema>;
};

type GetTweetInputs = {
  ctx: TrpcContext;
  input: z.infer<typeof getTweetSchema>;
};

type ListTweetsInput = {
  ctx: TrpcContext;
  input: z.infer<typeof listTweetSchema>;
};

type TweetActionInput = {
  ctx: TrpcContext;
  input: z.infer<typeof tweetActionSchema>;
};

export enum InteractionType {
  RETWEET = "retweet",
  SAVE = "savedTweet",
  LIKE = "like",
}

export enum InteractionAction {
  DO = "create",
  UNDO = "deleteMany",
  VERIFY = "findFirst",
}

export const createTweet = async ({ ctx, input }: CreateTweetInput) => {
  const { prisma, session } = ctx;
  const { content, parentTweetId } = input;

  const createRequest = createTweetRequest(
    content,
    parentTweetId,
    session?.user?.id as string
  );
  const tweet = await prisma.tweet.create(createRequest);
  return tweet;
};

export const get = async ({ ctx, input }: GetTweetInputs) => {
  const { prisma } = ctx;
  const { id } = input;

  const getRequest = getTweetRequest(id);
  const tweet = await prisma.tweet.findUnique(getRequest);
  return tweet;
};

export const list = async ({ ctx, input }: ListTweetsInput) => {
  const { prisma, session } = ctx;
  const { cursor, limit, userId, type } = input;

  const tweetListRequest = getTweetListRequest({
    limit,
    cursor,
    type,
    loggedUserId: session?.user?.id,
    profileUserId: userId,
  }) as Parameters<typeof prisma.tweet.findMany>[0];

  let tweets = await prisma.tweet.findMany(tweetListRequest);

  tweets = await Promise.all(
    tweets.map(async (tweet) => {
      const inputs = { ctx, input: { tweetId: tweet.id } };
      return {
        ...tweet,
        retweetedByUser: await isRetweeted(inputs),
        savedByUser: await isSaved(inputs),
        likedByUser: await isLiked(inputs),
      };
    })
  );

  let nextCursor: typeof cursor | undefined = undefined;
  if (tweets.length > limit) {
    const nextItem = tweets.pop() as (typeof tweets)[0];
    nextCursor = nextItem.id;
  }
  return {
    tweets,
    nextCursor,
  };
};

const isRetweeted = async (tweetInputs: TweetActionInput) =>
  interactionAction(
    tweetInputs,
    InteractionType.RETWEET,
    InteractionAction.VERIFY
  );

const isSaved = async (tweetInputs: TweetActionInput) =>
  interactionAction(
    tweetInputs,
    InteractionType.SAVE,
    InteractionAction.VERIFY
  );

const isLiked = async (tweetInputs: TweetActionInput) =>
  interactionAction(
    tweetInputs,
    InteractionType.LIKE,
    InteractionAction.VERIFY
  );

const interactionAction = async (
  { ctx, input }: TweetActionInput,
  type: InteractionType,
  action: InteractionAction
) => {
  const { prisma, session } = ctx;
  const { tweetId } = input;

  const userId = session?.user?.id as string;
  const interactionRequest = getInteractionRequest(tweetId, userId, action);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const interactionResult = await prisma[type][action](interactionRequest);

  return action === InteractionAction.VERIFY
    ? !!interactionResult
    : interactionResult;
};

export const interactionHandler = async (
  tweetInputs: TweetActionInput,
  type: InteractionType
) => {
  if (await interactionAction(tweetInputs, type, InteractionAction.VERIFY))
    await interactionAction(tweetInputs, type, InteractionAction.UNDO);
  else await interactionAction(tweetInputs, type, InteractionAction.DO);
};
