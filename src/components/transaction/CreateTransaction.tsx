import {
  ChangeEvent,
  FormEvent,
  LegacyRef,
  useContext,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import {
  CAT_BILLS,
  CAT_CAR_PAYMENT,
  CAT_CREDIT_CARD_PAYMENTS,
  CAT_ENTERTAINMENT,
  CAT_FOOD,
  CAT_GROCERIES,
  CAT_INCOME,
  CAT_INSURANCE,
  CAT_INTERNET,
  CAT_INVESTMENTS,
  CAT_MEMBERSHIPS,
  CAT_OTHER,
  CAT_PHONE,
  CAT_RENT,
  CAT_SAVINGS,
  CAT_SHOPPING,
  CAT_STUDENT_LOANS,
  CAT_SUBSCRIPTIONS,
  CAT_TAXES,
  CAT_TRANSPORTATION,
  CAT_UTILITIES,
  TXN_TYPE_EXPENSE,
  recurringTransactionInput,
  transactionInput,
} from "~/constants";
import type {
  transactionCategory,
  transactionFrequency,
  transactionType,
} from "~/types";
import { api } from "~/utils/api";

const CreateTransaction = () => {
  // const [newTransaction, setNewTransaction] = useState(transactionInput);
  const [amount, setAmount] = useState(0.0);
  const [type, setType] = useState<transactionType>(TXN_TYPE_EXPENSE);
  const [category, setCategory] = useState<transactionCategory>(CAT_FOOD);
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState("biweekly");
  const [startDate, setStartDate] = useState(new Date());

  const [open, setOpen] = useState(false);
  const [recurring, setRecurring] = useState(false);

  const trpc = api.useContext();

  const { mutate: singleTxnMutate } = api.transaction.create.useMutation({
    onMutate: async () => {
      await trpc.transaction.all.cancel();

      const previousTransactions = trpc.transaction.all.getData();

      trpc.transaction.all.setData(undefined, (prev) => {
        const optimisticTransaction = {
          id: "optimistic-id",
          amount: amount,
          type: type,
          category: category,
          date: date,
          note: note,
        };
        if (!prev) {
          return [optimisticTransaction];
        }
        return [...prev, optimisticTransaction];
      });

      refreshForm();

      return { previousTransactions };
    },
    onError: (error, transaction, ctx) => {
      toast.error(error.message);
      refreshForm();
      trpc.transaction.all.setData(undefined, () => ctx?.previousTransactions);
    },
    onSettled: async () => {
      await trpc.transaction.all.invalidate();
    },
  });

  const { mutate: recurringTxnMutate } =
    api.recurringTransaction.create.useMutation({
      onMutate: async () => {
        await trpc.recurringTransaction.all.cancel();

        const previousTransactions = trpc.recurringTransaction.all.getData();

        trpc.recurringTransaction.all.setData(undefined, (prev) => {
          const optimisticTransaction = {
            id: "optimistic-id",
            amount: amount,
            type: type,
            category: category,
            frequency: frequency,
            startDate: startDate,
            note: note,
          };
          if (!prev) {
            return [optimisticTransaction];
          }
          return [...prev, optimisticTransaction];
        });

        refreshForm();

        return { previousTransactions };
      },
      onError: (error, transaction, ctx) => {
        toast.error(error.message);
        refreshForm();
        trpc.recurringTransaction.all.setData(
          undefined,
          () => ctx?.previousTransactions
        );
      },
      onSettled: async () => {
        await trpc.recurringTransaction.all.invalidate();
      },
    });

  const refreshForm = () => {
    setAmount(0.0);
    setType(TXN_TYPE_EXPENSE);
    setCategory(CAT_FOOD);
    setDate(new Date());
    setNote("");
    setRecurring(false);
  };

  const addRecurringTransaction = (e: FormEvent<HTMLFormElement>) => {
    if (category === CAT_OTHER && note === "") {
      e.preventDefault();

      toast.error("Please enter a note for this transaction");
    } else {
      const result = recurringTransactionInput.safeParse({
        amount: amount,
        type: type,
        category: category,
        frequency: frequency,
        startDate: startDate,
        note: note,
      });
      if (!result.success) {
        console.log(result.error);
        toast.error(result.error.format()._errors.join("\n"));
        return;
      }
      // create transaction
      recurringTxnMutate({
        amount: amount,
        type: type,
        category: category,
        frequency: frequency,
        startDate: startDate,
        note: note,
      });
      if (startDateIsToday(date)) {
        addTransaction(e);
      }
    }
  };

  const startDateIsToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const addTransaction = (e: FormEvent<HTMLFormElement>) => {
    if (category === CAT_OTHER && note === "") {
      console.log("uhhh");
      e.preventDefault();

      toast.error("Please enter a note for this transaction");
    } else {
      const result = transactionInput.safeParse({
        amount: amount,
        type: type,
        category: category,
        date: date,
        note: note,
      });
      if (!result.success) {
        console.log(result.error);
        toast.error(result.error.format()._errors.join("\n"));
        return;
      }
      // create transaction
      singleTxnMutate({
        amount: amount,
        type: type,
        category: category,
        date: date,
        note: note,
      });
    }
  };

  return (
    <>
      <button
        id="open"
        className="cursor-pointer rounded-md bg-transparent px-4 py-1 text-2xl font-bold text-gray-50 transition duration-200 ease-in-out hover:text-3xl hover:text-green-100"
        onClick={() => setOpen(true)}
      >
        +
      </button>

      <div
        id="overlay"
        className={`fixed inset-0 z-40 ${
          open ? "" : "hidden"
        } h-screen w-screen bg-gray-900 bg-opacity-60`}
      ></div>

      <div
        id="dialog"
        className={`fixed left-1/2 top-1/2 z-50 ${
          open ? "" : "hidden"
        } w-96 -translate-x-1/2 -translate-y-1/2 space-y-5 rounded-md bg-blue-950 px-8 py-6 text-gray-100 drop-shadow-lg`}
      >
        <form
          className="space-y-5"
          onSubmit={(e) =>
            recurring ? addRecurringTransaction(e) : addTransaction(e)
          }
        >
          <div className="flex flex-row justify-between space-y-2 align-middle">
            <div className="flex flex-col space-y-2">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                className="rounded-md bg-blue-900 px-4 py-2"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col space-x-2 align-text-bottom">
              <div className="py-2"></div>
              <label className="flex cursor-pointer items-center">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={recurring}
                    onChange={() => setRecurring(!recurring)}
                  />
                  <div className="toggle__line h-10 w-4 translate-x-1 transform rounded-full bg-gray-400 shadow-inner"></div>
                  <div
                    className={`
          toggle__dot absolute h-6 w-6 transform rounded-full bg-white shadow 
          ${recurring ? "-translate-y-5" : "-translate-y-11"}
        `}
                  ></div>
                </div>
                <div className="flex flex-col">
                  <div
                    className={`${
                      recurring ? "text-gray-700" : "text-gray-200"
                    } ml-3 font-medium`}
                  >
                    One Time
                  </div>
                  <div
                    className={`${
                      recurring ? "text-gray-200" : "text-gray-700"
                    } ml-3 font-medium`}
                  >
                    Recurring
                  </div>
                </div>
              </label>
            </div>
          </div>
          {recurring ? (
            <div className="flex flex-row justify-between">
              <div className="flex flex-col space-y-2">
                <label htmlFor="frequency">Frequency</label>
                <select
                  id="frequency"
                  className="rounded-md bg-blue-900 px-4 py-2"
                  value={frequency}
                  onChange={(e) =>
                    setFrequency(e.target.value as transactionFrequency)
                  }
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex flex-col space-y-2">
                <label htmlFor="startDate">Start Date</label>
                <input
                  id="startDate"
                  type="date"
                  className="rounded-md bg-blue-900 px-4 py-1.5"
                  value={startDate.toISOString().split("T")[0]}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                />
              </div>
            </div>
          ) : null}
          {recurring ? null : (
            <div className="flex flex-col space-y-2">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                className="rounded-md bg-blue-900 px-4 py-2"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
              />
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              className="rounded-md bg-blue-900 px-4 py-2"
              value={type}
              onChange={(e) => setType(e.target.value as transactionType)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              className="rounded-md bg-blue-900 px-4 py-2"
              onChange={(e) =>
                setCategory(e.target.value as transactionCategory)
              }
            >
              {type === TXN_TYPE_EXPENSE ? (
                <>
                  <option value={CAT_FOOD}>Food</option>
                  <option value={CAT_GROCERIES}>Groceries</option>
                  <option value={CAT_CAR_PAYMENT}>Car Payment</option>
                  <option value={CAT_BILLS}>Bills</option>
                  <option value={CAT_ENTERTAINMENT}>Entertainment</option>
                  <option value={CAT_INSURANCE}>Insurance</option>
                  <option value={CAT_RENT}>Rent</option>
                  <option value={CAT_INVESTMENTS}>Investments</option>
                  <option value={CAT_INTERNET}>Internet</option>
                  <option value={CAT_CREDIT_CARD_PAYMENTS}>
                    Credit Car Payment
                  </option>
                  <option value={CAT_MEMBERSHIPS}>Membership</option>
                  <option value={CAT_PHONE}>Phone</option>
                  <option value={CAT_SAVINGS}>Savings</option>
                  <option value={CAT_STUDENT_LOANS}>
                    Student Loan Payment
                  </option>
                  <option value={CAT_SUBSCRIPTIONS}>Subscription</option>
                  <option value={CAT_UTILITIES}>Utilities</option>
                  <option value={CAT_TRANSPORTATION}>Transportation</option>
                  <option value={CAT_TAXES}>Taxes</option>
                  <option value={CAT_SHOPPING}>Shopping</option>
                </>
              ) : (
                <>
                  <option value={CAT_INCOME}>Income</option>
                  <option value={CAT_INVESTMENTS}>Investments</option>
                </>
              )}
              <option value={CAT_OTHER}>Other</option>
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <label className="hidden" htmlFor="note">
              Note
            </label>
            <textarea
              id="note"
              placeholder="Add a description"
              className={`rounded-md bg-blue-900 px-4 py-2 ${
                category === CAT_OTHER && note === ""
                  ? "border border-red-600"
                  : ""
              }`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>

          <div className="flex justify-between">
            <button
              id="add-transaction"
              type="submit"
              className={`cursor-pointer rounded-md bg-transparent px-5 py-2 text-white hover:bg-blue-900`}
            >
              Add Transaction
            </button>
            <button
              id="cancel"
              onClick={() => {
                setOpen(false);
                refreshForm();
              }}
              className="cursor-pointer rounded-md bg-transparent px-5 py-2 text-white hover:bg-blue-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateTransaction;
