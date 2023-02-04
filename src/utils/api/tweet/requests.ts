import { InteractionAction } from "./index";

export enum TweetListType {
  TIMELINE = "TIMELINE", // Logged User follwers tweets and retweets
  PROFILE = "PROFILE", // Profile User tweets and retweets
  PROFILE_REPLIES = "PROFILE_REPLIES", // Profile User tweets and replies
  PROFILE_MEDIA = "PROFILE_MEDIA", // Profile User tweets with media
  PROFILE_LIKES = "PROFILE_LIKES", // Profile User liked tweets
  EXPLORE = "EXPLORE", // All tweets
  EXPLORE_MEDIA = "EXPLORE_MEDIA", // All tweets with media
  SAVED = "SAVED", // LoggedUser's saved tweets saved by user
  SAVED_REPLIES = "SAVED_REPLIES", // LoggedUser's saved tweets and replies
  SAVED_MEDIA = "SAVED_MEDIA", // LoggedUser's saved tweets with media
  LIKES = "LIKES", // LoggedUser's liked tweets
}

type TweetListFilters = {
  type: TweetListType;
  loggedUserId?: string;
  profileUserId?: string | null | undefined;
};

interface TweetListRequestArgs {
  limit: number;
  cursor?: string | null | undefined;
  loggedUserId?: string;
  profileUserId?: string | null | undefined;
  type: TweetListType;
}

export const createTweetRequest = (
  content: string,
  parentTweetId: string | null | undefined,
  image: string | null | undefined,
  authorId: string,
  privateReply: boolean
) => ({
  data: {
    content,
    author: {
      connect: {
        id: authorId,
      },
    },
    privateReply,
    parent: parentTweetId
      ? {
          connect: {
            id: parentTweetId,
          },
        }
      : undefined,
    image,
  },
});

export const getTweetRequest = (id: string) => ({
  where: {
    id,
  },
  include: {
    replies: true,
    retweets: true,
    likes: true,
    author: true,
    saves: true,
    parent: true,
  },
});

export const getInteractionRequest = (
  tweetId: string,
  authorId: string,
  action: InteractionAction
) =>
  action === InteractionAction.DO
    ? createInteractionRequest(tweetId, authorId)
    : findOrDeleteInteractionRequest(tweetId, authorId);
const createInteractionRequest = (tweetId: string, authorId: string) => ({
  data: {
    tweet: {
      connect: {
        id: tweetId,
      },
    },
    author: {
      connect: {
        id: authorId,
      },
    },
  },
});

const findOrDeleteInteractionRequest = (tweetId: string, authorId: string) => ({
  where: {
    tweetId,
    authorId,
  },
});

export const getTweetListRequest = ({
  type,
  limit,
  cursor,
  loggedUserId,
  profileUserId,
}: TweetListRequestArgs) => ({
  take: limit + 1,
  orderBy: { createdAt: "desc" },
  ...getTweetListFilters({ type, loggedUserId, profileUserId }),
  cursor: cursor ? { id: cursor } : undefined,
  include: {
    author: true,
    parent: true,
    retweets: {
      include: {
        author: true,
      },
      where: {
        author: {
          followers: {
            some: {
              followerId: loggedUserId,
            },
          },
        },
      },
    },
    replies: {
      include: {
        author: true,
      },
    },
    _count: true,
  },
});

const getTweetListFilters = ({
  type,
  loggedUserId,
  profileUserId,
}: TweetListFilters): object => {
  const userId = getUserIdForFilters(type, loggedUserId, profileUserId);
  if (!userId) return exploreFilters();
  switch (type) {
    case TweetListType.TIMELINE:
      return timelineFilters(userId);

    case TweetListType.PROFILE:
      return profileFilters(userId);

    case TweetListType.PROFILE_REPLIES:
      return profileFilters(userId, true);

    case TweetListType.PROFILE_MEDIA:
      return profileFilters(userId, false, true);

    case TweetListType.PROFILE_LIKES:
      return profileLikesFilters(userId);

    case TweetListType.EXPLORE:
      return exploreFilters();

    case TweetListType.EXPLORE_MEDIA:
      return exploreFilters(true);

    case TweetListType.SAVED:
      return savedFilters(userId);

    case TweetListType.SAVED_REPLIES:
      return savedFilters(userId, true);

    case TweetListType.SAVED_MEDIA:
      return savedFilters(userId, false, true);

    case TweetListType.LIKES:
      return likesFilter(userId);

    default:
      return exploreFilters();
  }
};

const getUserIdForFilters = (
  type: TweetListType,
  loggedUser: string | undefined,
  profileUserId: string | undefined | null
) => (type.includes("PROFILE") ? profileUserId : loggedUser);

const timelineFilters = (userId: string) => ({
  where: {
    parentId: null,
    OR: [
      {
        author: {
          followers: {
            some: {
              followerId: userId,
            },
          },
        },
      },
      {
        retweets: {
          some: {
            author: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        },
      },
    ],
  },
});

const profileFilters = (
  userId: string,
  withReplies = false,
  onlyMedia = false
) => ({
  where: {
    parentId: withReplies ? undefined : null,
    OR: [
      {
        authorId: userId,
      },
      {
        retweets: {
          some: {
            authorId: userId,
          },
        },
      },
    ],
    image: onlyMedia ? { not: null } : undefined,
  },
});

const profileLikesFilters = (userId: string) => ({
  where: {
    parentId: null,
    likes: {
      some: {
        authorId: userId,
      },
    },
  },
});

const exploreFilters = (onlyMedia = false) => ({
  where: {
    parentId: null,
    image: onlyMedia ? { not: null } : undefined,
  },
});

const savedFilters = (
  userId: string,
  withReplies = false,
  onlyMedia = false
) => ({
  where: {
    parentId: withReplies ? undefined : null,
    saves: {
      some: {
        authorId: userId,
      },
    },
    image: onlyMedia ? { not: null } : undefined,
  },
});

const likesFilter = (userId: string) => ({
  where: {
    likes: {
      some: {
        authorId: userId,
      },
    },
  },
});
