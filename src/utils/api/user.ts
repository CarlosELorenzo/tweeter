import type { z } from "zod";
import type {
  editUserSchema,
  getUserSchema,
  getFollowerSchema,
} from "@utils/schemas/user";
import type { TrpcContext } from "./helpers";

type UserRouterInputs = {
  ctx: TrpcContext;
  input: z.infer<typeof getUserSchema>;
};

type EditUserRouterInputs = {
  ctx: TrpcContext;
  input: z.infer<typeof editUserSchema>;
};

type getFollowerRouterInputs = {
  ctx: TrpcContext;
  input: z.infer<typeof getFollowerSchema>;
};

export const getUser = async ({ ctx, input }: UserRouterInputs) => {
  const { prisma, session } = ctx;
  const { id } = input;
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      followers: {
        where: {
          followerId: session?.user?.id,
        },
      },
      _count: {
        select: {
          followers: true,
          follows: true,
        },
      },
    },
  });
  return user;
};

export const isFollowed = async ({ ctx, input }: UserRouterInputs) => {
  const { prisma, session } = ctx;
  const { id } = input;
  const userId = session?.user?.id;
  const follow = await prisma.follow.findFirst({
    where: {
      followerId: userId,
      followingId: id,
    },
  });
  return !!follow;
};

export const follow = async ({ ctx, input }: UserRouterInputs) => {
  const { prisma, session } = ctx;
  const { id } = input;
  const userId = session?.user?.id as string;
  const follow = await prisma.follow.create({
    data: {
      followerId: userId,
      followingId: id,
    },
  });
  return follow;
};

export const unFollow = async ({ ctx, input }: UserRouterInputs) => {
  const { prisma, session } = ctx;
  const { id } = input;
  const userId = session?.user?.id as string;
  const follow = await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: id,
      },
    },
  });
  return follow;
};

export const editUser = async ({ ctx, input }: EditUserRouterInputs) => {
  const { prisma, session } = ctx;
  const { ...data } = input;
  const userId = session?.user?.id as string;
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data,
  });
  return user;
};

export const isFollower = async ({ ctx, input }: getFollowerRouterInputs) => {
  const { prisma } = ctx;
  const { followerId, followingId } = input;
  const follower = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  });
  return !!follower;
};
