import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { transactionInput } from "~/constants";
import { addFrequencyToDate } from "~/server/utils";

export const transactionRouter = createTRPCRouter({
  all: protectedProcedure
    .query(async ({ctx}) => {
      const currentDate = new Date();
  
      // Get all recurring transactions due today or earlier
      const dueRecurringTransactions = await ctx.prisma.recurringTransaction.findMany({
        where: {
          authorId: ctx.session.user.id,
          nextTransactionDate: {
            lte: currentDate,
          },
        },
      });
  
      // For each recurring transaction, create a transaction and update the next transaction date
      for (const recurringTransaction of dueRecurringTransactions) {
        await ctx.prisma.transaction.create({
          data: {
            amount: recurringTransaction.amount,
            type: recurringTransaction.type,
            date: recurringTransaction.nextTransactionDate as Date,
            category: recurringTransaction.category,
            note: recurringTransaction.note,
            authorId: recurringTransaction.authorId,
            // ...other fields...
          },
        });

        const newNextTransactionDate = addFrequencyToDate(recurringTransaction.nextTransactionDate as Date, recurringTransaction.frequency);
  
        await ctx.prisma.recurringTransaction.update({
          where: {
            id: recurringTransaction.id,
          },
          data: {
            nextTransactionDate: newNextTransactionDate
          },
        });
      }
      const transactions = await ctx.prisma.transaction.findMany({
        where: {
          authorId: ctx.session.user.id,
        },
      });
      return transactions.map(({id, type, amount, note, date, category}) => ({id, type, amount, note, date, category}));
    }),

  create: protectedProcedure.input(transactionInput).mutation(async ({ctx, input}) => {
    const transaction = await ctx.prisma.transaction.create({
      data: {
        amount: input.amount,
        note: input.note,
        date: input.date,
        category: input.category,
        type: input.type,
        author: {
          connect: {
            id: ctx.session.user.id,
          },
        }
      }
    });
    return transaction;
  }),

  delete: protectedProcedure.input(z.string()).mutation(async ({ctx, input}) => {
    const transaction = await ctx.prisma.transaction.delete({
      where: {
        id: input,
      }
    });
    return transaction;
  }),

  update: protectedProcedure.input(transactionInput).mutation(async ({ctx, input}) => {
    const transaction = await ctx.prisma.transaction.update({
      where: {
        id: input.id,
      },
      data: {
        amount: input.amount,
        note: input.note,
        date: input.date,
        category: input.category,
        type: input.type,
      }
    });
    return transaction;
  }),
});
