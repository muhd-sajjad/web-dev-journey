import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import AppLayout from "./layout/AppLayout.js";
import DashboardPage from "./pages/DashboardPage.js";
import AddExpensePage from "./pages/AddExpensePage.js";
import ReportsPage from "./pages/ReportsPage.js";
import NotFoundPage from "./pages/NotFoundPage.js"; 
import type { Expense,ExpenseInput } from "./types/expense.ts";
import { fetchExpenses, createExpense, deleteExpense } from "./libs/api.ts";
const STORAGE_KEY = "trackly-expenses";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
  async function loadExpenses() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }

  loadExpenses();
}, []);

useEffect(() => {
  document.title = `Trackly (${expenses.length} expenses)`;
}, [expenses.length]);
async function handleAddExpense(newExpense: ExpenseInput) {
  const savedExpense = await createExpense(newExpense);
  setExpenses((prevExpenses) => [savedExpense, ...prevExpenses]);
}
async function handleDeleteExpense(id: number) {
  await deleteExpense(id);
  setExpenses((prevExpenses) =>
    prevExpenses.filter((item) => item.id !== id)
  );
}
if (loading) {
  return (
    <div className="app">
      <p>Loading Trackly...</p>
    </div>
  );
}

if (error) {
  return (
    <div className="app">
      <p className="error-text">Error: {error}</p>
    </div>
  );
}

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route
          index
          element={
            <DashboardPage
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
            />
          }
        />
        <Route
          path="add-expense"
          element={<AddExpensePage onAddExpense={handleAddExpense} />}
        />
        <Route
          path="reports"
          element={<ReportsPage expenses={expenses} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;