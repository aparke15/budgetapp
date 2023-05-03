import { FC, useState } from "react";
import { Transaction } from "~/types";
import { api } from "~/utils/api";

interface TransactionProps {
  transaction: Transaction;
}

const Transaction: FC<TransactionProps> = ({ transaction }) => {
  const { id, amount, note, type, category, date } = transaction;

  const [showNotes, setShowNotes] = useState(false);

  const trpc = api.useContext();

  return (
    <tr
      key={`txn-${id}`}
      className="border-b text-gray-300 transition duration-300 ease-in-out hover:bg-slate-400 dark:border-neutral-500 dark:hover:bg-neutral-600"
    >
      <td className="whitespace-nowrap px-6 py-4">
        <button
          className="rounded-full bg-transparent text-xl"
          onClick={() => setShowNotes((prev) => !prev)}
        >
          {category}
        </button>
        {showNotes ? <div className="text-sm">{note}</div> : null}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div
          className={`text-right ${
            type === "income" ? "text-green-600" : "text-red-600"
          }`}
        >
          {amount}
        </div>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-center">{`${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`}</td>
    </tr>
  );
};

export default Transaction;
