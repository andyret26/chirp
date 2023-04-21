import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { TRPCError } from "@trpc/server";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
});

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => ctx.prisma.post.findMany({
    include: {
      author: true,
    },
    orderBy: {
      creaedAt: "desc",
    },
  })),

  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: {
          userId: input.userId,
        },
        include: {
          author: true,
        },
        orderBy: {
          creaedAt: "desc",
        },
      });
      return posts;
    }),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().emoji("Only Emojis Allowed!!").min(1).max(255),
      }),
    ).mutation(async ({ ctx, input }) => {
      const { success } = await ratelimit.limit(ctx.session.user.id);

      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          userId: ctx.session.user.id,
          content: input.content,
        },
      });

      return post;
    }),
});
