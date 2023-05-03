import { useState } from "react";
import { toast } from "react-hot-toast";
import { todoInput } from "~/constants";
import { api } from "~/utils/api";

const CreateTodo = () => {
  const [todo, setTodo] = useState("");

  const trpc = api.useContext();

  const { mutate } = api.todo.create.useMutation({
    onMutate: async () => {
      await trpc.todo.all.cancel();

      const previousTodos = trpc.todo.all.getData();

      trpc.todo.all.setData(undefined, (prev) => {
        const optmisiticTodo = {
          id: "optimistic-id",
          content: todo,
          done: false,
        };
        if (!prev) {
          return [optmisiticTodo];
        }
        return [...prev, optmisiticTodo];
      });

      setTodo("");

      return { previousTodos };
    },
    onError: (error, todo, ctx) => {
      toast.error(error.message);
      setTodo("");
      trpc.todo.all.setData(undefined, () => ctx?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  const handleAddTodo = () => {
    console.log(todo);
    const result = todoInput.safeParse(todo);
    if (!result.success) {
      console.log(result.error);
      toast.error(result.error.format()._errors.join("\n"));
      return;
    }
    // create todo
    mutate(todo);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddTodo();
        }}
        className="flex gap-2"
      >
        <input
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          type="text"
          name="new-todo"
          id="new-todo"
          placeholder="New todo..."
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <button
          className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
          type="submit"
        >
          Add Todo
        </button>
      </form>
    </div>
  );
};

export default CreateTodo;
