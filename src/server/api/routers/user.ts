import { follow, getUser, isFollowed, unFollow } from "../../../utils/api/user";
import { getUserSchema } from "../../../utils/schemas/user";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  get: publicProcedure.input(getUserSchema).query(getUser),
  follow: protectedProcedure
    .input(getUserSchema)
    .mutation(async ({ ctx, input }) => {
      if (!(await isFollowed({ ctx, input })))
        return await follow({ ctx, input });
      else return unFollow({ ctx, input });
    }),
});
