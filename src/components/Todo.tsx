import type { FC } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Todo } from "~/types";
import { api } from "~/utils/api";

interface TodoProps {
  todo: Todo;
}

const Todo: FC<TodoProps> = ({ todo }) => {
  const { id, content, done } = todo;

  const trpc = api.useContext();

  const { mutate: doneMutation } = api.todo.toggle.useMutation({
    onMutate: async ({ id, done }) => {
      await trpc.todo.all.cancel();

      const previousTodos = trpc.todo.all.getData();

      trpc.todo.all.setData(undefined, (prev) => {
        if (!prev) {
          return previousTodos;
        }
        return prev.map((todo) => {
          if (todo.id === id) {
            return { ...todo, done };
          }
          return todo;
        });
      });

      return { previousTodos };
    },
    onError: (error, todo, ctx) => {
      toast.error(`An error occured`);
      trpc.todo.all.setData(undefined, () => ctx?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  const { mutate: deleteMutation } = api.todo.delete.useMutation({
    onMutate: async (deleteId) => {
      await trpc.todo.all.cancel();

      const previousTodos = trpc.todo.all.getData();

      trpc.todo.all.setData(undefined, (prev) => {
        if (!prev) {
          return previousTodos;
        }
        return prev.filter((todo) => todo.id !== deleteId);
      });

      return { previousTodos };
    },
    onError: (error, todo, ctx) => {
      toast.error(error.message);
      trpc.todo.all.setData(undefined, () => ctx?.previousTodos);
    },
    onSettled: async () => {
      await trpc.todo.all.invalidate();
    },
  });

  return (
    <div className="flex items-center justify-between rounded-lg bg-white px-4 py-2 shadow-md dark:bg-gray-800">
      <div>
        <input
          type="checkbox"
          className="focus mr-2 h-4 w-4 cursor-pointer border border-gray-300 bg-gray-50"
          name="done"
          id="done"
          checked={done}
          onChange={(e) => doneMutation({ id, done: e.target.checked })}
        />
        <label htmlFor="done" className={`cursor-pointer text-white`}>
          {content}
        </label>
      </div>
      <button
        className={`ml-3 flex-shrink-0 transform rounded-md bg-blue-500 px-2 py-1 text-xs font-medium text-white transition-colors duration-200 hover:bg-blue-600 focus:bg-blue-600 focus:outline-none`}
        onClick={() => deleteMutation(id)}
      >
        Delete
      </button>
    </div>
  );
};

export default Todo;
