import { z } from "zod";

export const CAT_FOOD = "Food";
export const CAT_TRANSPORTATION = "Transportation";
export const CAT_ENTERTAINMENT = "Entertainment";
export const CAT_SHOPPING = "Shopping";
export const CAT_INCOME = "Income";
export const CAT_SAVINGS = "Savings";
export const CAT_INVESTMENTS = "Investments";
export const CAT_CREDIT_CARD_PAYMENTS = "Credit Card Payments";
export const CAT_RENT = "Rent";
export const CAT_CAR_PAYMENT = "Car Payment";
export const CAT_STUDENT_LOANS = "Student Loans";
export const CAT_INSURANCE = "Insurance";
export const CAT_UTILITIES = "Utilities";
export const CAT_PHONE = "Phone";
export const CAT_INTERNET = "Internet";
export const CAT_SUBSCRIPTIONS = "Subscriptions";
export const CAT_MEMBERSHIPS = "Memberships";
export const CAT_TAXES = "Taxes";
export const CAT_BILLS = "Bills";
export const CAT_GROCERIES = "Groceries";
export const CAT_OTHER = "Other";
export const categories = [
    CAT_FOOD,
    CAT_TRANSPORTATION,
    CAT_ENTERTAINMENT,
    CAT_SHOPPING,
    CAT_INCOME,
    CAT_SAVINGS,
    CAT_INVESTMENTS,
    CAT_CREDIT_CARD_PAYMENTS,
    CAT_RENT,
    CAT_CAR_PAYMENT,
    CAT_STUDENT_LOANS,
    CAT_INSURANCE,
    CAT_UTILITIES,
    CAT_PHONE,
    CAT_INTERNET,
    CAT_SUBSCRIPTIONS,
    CAT_MEMBERSHIPS,
    CAT_TAXES,
    CAT_BILLS,
    CAT_OTHER,
];

export const TXN_TYPE_EXPENSE = "expense";
export const TXN_TYPE_INCOME = "income";


export const categoriesInputs = z.enum([
  "Income",
  "Food",
  "Groceries",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Savings",
  "Investments",
  "Credit Card Payments",
  "Rent",
  "Car Payment",
  "Student Loans",
  "Insurance",
  "Utilities",
  "Phone",
  "Internet",
  "Subscriptions",
  "Memberships",
  "Taxes",
  "Bills",
  "Other",
]);

export const todoInput = z.string({
  required_error: "Please enter a todo",
}).min(1).max(100);

export const transactionInput = z.object({
  id: z.string().optional(),
  amount: z.number(),
  note: z.string(),
  date: z.date(),
  category: categoriesInputs,
  type: z.enum([TXN_TYPE_EXPENSE, TXN_TYPE_INCOME])
});

export const recurringTransactionInput = z.object({
  id: z.string().optional(),
  category: categoriesInputs,
  type: z.enum([TXN_TYPE_EXPENSE, TXN_TYPE_INCOME]),
  amount: z.number(),
  frequency: z.string(),
  note: z.string().optional(),
  startDate: z.date(),
});
