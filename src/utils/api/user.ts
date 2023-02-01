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
    },
  });
  return user;
};

