import { getUser } from "../../../utils/api/user";
import { getUserSchema } from "../../../utils/schemas/user";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  get: publicProcedure.input(getUserSchema).query(getUser),
});
