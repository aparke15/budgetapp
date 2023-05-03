import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { todoInput } from "~/constants";

export const todoRouter = createTRPCRouter({
  all: protectedProcedure
    .query(async ({ctx}) => {
      const todos = await ctx.prisma.todo.findMany({
        where: {
          authorId: ctx.session.user.id,
        },
      });
      return todos.map(({id, content, done}) => ({id, content, done}));
    }),

    create: protectedProcedure.input(todoInput).mutation(async ({ctx, input}) => {
      const todo = await ctx.prisma.todo.create({
        data: {
          content: input,
          author: {
            connect: {
              id: ctx.session.user.id,
            },
          }
        }
      });
      return todo;
    }),

    delete: protectedProcedure.input(z.string()).mutation(async ({ctx, input}) => {
      const todo = await ctx.prisma.todo.delete({
        where: {
          id: input,
        }
      });
      return todo;
    }),
    
    toggle: protectedProcedure.input(z.object({
      id: z.string(),
      done: z.boolean(),
    })).mutation(async ({ctx, input}) => {
      const todo = await ctx.prisma.todo.update({
        where: {
          id: input.id,
        },
        data: {
          done: input.done,
        }
      });
      return todo;
    }),

});
