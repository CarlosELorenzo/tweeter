import type { z } from "zod";
import type { getUserSchema } from "../schemas/user";
import type { TrpcContext } from "./helpers";

type UserRouterInputs = {
  ctx: TrpcContext;
  input: z.infer<typeof getUserSchema>;
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
