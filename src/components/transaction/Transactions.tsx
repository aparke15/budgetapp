import { api } from "../../utils/api";
import Transaction from "./Transaction";

const Transactions = () => {
  const {
    data: transactions,
    isLoading,
    isError,
  } = api.transaction.all.useQuery();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error bad </div>;
  console.log("txns: ", transactions);

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full text-left text-sm font-light">
              <thead className="border-b text-2xl font-thin text-gray-200 dark:border-neutral-500">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  ? transactions.map((transaction) => (
                      <Transaction
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))
                  : "Create some transactions"}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Transactions;
