import { z } from "zod";
import type { AppRouter } from "~/server/api/root";
import type { inferRouterOutputs } from "@trpc/server";
import type { CAT_BILLS, CAT_CAR_PAYMENT, CAT_CREDIT_CARD_PAYMENTS, CAT_ENTERTAINMENT, CAT_FOOD, CAT_INCOME, CAT_INSURANCE, CAT_INTERNET, CAT_INVESTMENTS, CAT_MEMBERSHIPS, CAT_OTHER, CAT_PHONE, CAT_RENT, CAT_SAVINGS, CAT_SHOPPING, CAT_STUDENT_LOANS, CAT_SUBSCRIPTIONS, CAT_TAXES, CAT_TRANSPORTATION, CAT_UTILITIES, TXN_TYPE_EXPENSE, TXN_TYPE_INCOME } from "./constants";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type allTodosOutput = RouterOutputs["todo"]["all"];
export type Todo = allTodosOutput[number];

type allTransactionsOutput = RouterOutputs["transaction"]["all"];
export type Transaction = allTransactionsOutput[number];

type allRecurringTransactionsOutput = RouterOutputs["recurringTransaction"]["all"];
export type RecurringTransaction = allRecurringTransactionsOutput[number];

export type transactionCategory =  
  typeof CAT_FOOD |
  typeof CAT_TRANSPORTATION |
  typeof CAT_ENTERTAINMENT |
  typeof CAT_SHOPPING |
  typeof CAT_INCOME |
  typeof CAT_SAVINGS |
  typeof CAT_INVESTMENTS |
  typeof CAT_CREDIT_CARD_PAYMENTS |
  typeof CAT_RENT |
  typeof CAT_CAR_PAYMENT |
  typeof CAT_STUDENT_LOANS |
  typeof CAT_INSURANCE |
  typeof CAT_UTILITIES |
  typeof CAT_PHONE |
  typeof CAT_INTERNET |
  typeof CAT_SUBSCRIPTIONS |
  typeof CAT_MEMBERSHIPS |
  typeof CAT_TAXES |
  typeof CAT_BILLS |
  typeof CAT_OTHER 

  export type transactionType = typeof TXN_TYPE_EXPENSE | typeof TXN_TYPE_INCOME;

  export type transactionFrequency = "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
