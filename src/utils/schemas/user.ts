import { z } from "zod";

export const getUserSchema = z.object({
  id: z.string().min(1),
});

export const editUserSchema = z.object({
  name: z.string().min(1).nullish(),
  username: z.string().min(1).nullish(),
  image: z.string().min(1).nullish(),
  bannerImage: z.string().min(1).nullish(),
  bio: z.string().min(1).nullish(),
});

export const getFollowerSchema = z.object({
  followerId: z.string().cuid(),
  followingId: z.string().cuid(),
});
