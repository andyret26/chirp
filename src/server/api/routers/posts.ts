import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => ctx.prisma.post.findMany({
    include: {
      author: true,
    },
    orderBy: {
      creaedAt: "desc",
    },
  })),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().emoji().min(1).max(255),
      }),
    ).mutation(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.create({
        data: {
          userId: ctx.session.user.id,
          content: input.content,
        },
      });

      return post;
    }),
});
