import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { recurringTransactionInput } from "~/constants";

export const recurringTransactionRouter = createTRPCRouter({
  all: protectedProcedure
    .query(async ({ctx}) => {
      const recurringTransactions = await ctx.prisma.recurringTransaction.findMany({
        where: {
          authorId: ctx.session.user.id,
        },
      });
      return recurringTransactions.map(({id, type, amount, frequency, startDate, category, note}) => ({id, type, amount, frequency, startDate, category, note}));
    }),
  create: protectedProcedure.input(recurringTransactionInput).mutation(async ({ctx, input}) => {
    const recurringTransaction = await ctx.prisma.recurringTransaction.create({
      data: {
        amount: input.amount,
        note: input.note,
        startDate: input.startDate,
        frequency: input.frequency,
        nextTransactionDate: input.startDate,
        category: input.category,
        type: input.type,
        author: {
          connect: {
            id: ctx.session.user.id,
          },
        }
      }
    });
    return recurringTransaction;
  }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ctx, input}) => {
    const recurringTransaction = await ctx.prisma.recurringTransaction.delete({
      where: {
        id: input,
      }
    });
    return recurringTransaction;
  }),
  update: protectedProcedure.input(recurringTransactionInput).mutation(async ({ctx, input}) => {
    const recurringTransaction = await ctx.prisma.recurringTransaction.update({
      where: {
        id: input.id,
      },
      data: {
        amount: input.amount,
        note: input.note,
        startDate: input.startDate,
        frequency: input.frequency,
        category: input.category,
        type: input.type,
      }
    });
    return recurringTransaction;
  }),
});
