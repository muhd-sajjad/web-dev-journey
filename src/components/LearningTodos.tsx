import { useEffect, useState } from "react";
interface Todo{
  id: number;
  title: string;
  completed: boolean;
}
function LearningTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchTodos() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos?_limit=6"
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setTodos(data);
    } catch (err:any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <section className="todo-widget">
      <div className="widget-header">
        <h2>Practice API Widget</h2>
        <button className="secondary-btn" onClick={fetchTodos}>
          Reload
        </button>
      </div>

      {loading && <p>Loading todos...</p>}

      {error && <p className="error-text">Error: {error}</p>}

      {!loading && !error && (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? "done" : ""}>
              <span>{todo.title}</span>
              <strong>{todo.completed ? "Done" : "Pending"}</strong>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default LearningTodos;   