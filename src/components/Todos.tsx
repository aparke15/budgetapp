import { api } from "../utils/api";
import Todo from "./Todo";

const Todos = () => {
  const { data: todos, isLoading, isError } = api.todo.all.useQuery();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error bad </div>;
  return (
    <div>
      {todos
        ? todos.map((todo) => <Todo key={todo.id} todo={todo} />)
        : "Create some todos"}
    </div>
  );
};
export default Todos;
