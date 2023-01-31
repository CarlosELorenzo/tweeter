import { PrismaClient } from "@prisma/client";
import { Session } from "next-auth";

export interface TrpcContext {
  session: Session | null;
  prisma: PrismaClient;
}
