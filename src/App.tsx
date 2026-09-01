import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import AppLayout from "./layout/AppLayout.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import AddExpensePage from "./pages/AddExpensePage.tsx";
import ReportsPage from "./pages/ReportsPage.tsx";
import NotFoundPage from "./pages/NotFoundPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import EditExpensePage from "./pages/EditExpensePage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import { useAuth } from "./context/AuthContext.tsx";
import type { Expense, ExpenseInput } from "./types/expense.ts";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
  updateExpense as updateExpenseApi
} from "./lib/api.ts";

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      setError("");
      document.title = "Trackly";
      return;
    }

    async function loadExpenses() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchExpenses();
        setExpenses(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load expenses";
        setError(message);

        if (message.toLowerCase().includes("401")) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }

    loadExpenses();
  }, [user, logout]);

  useEffect(() => {
    document.title = user ? `Trackly (${expenses.length} expenses)` : "Trackly";
  }, [user, expenses.length]);

  async function handleAddExpense(newExpense: ExpenseInput) {
    try {
      const savedExpense = await createExpense(newExpense);
      setExpenses((prevExpenses) => [savedExpense, ...prevExpenses]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add expense";

      if (message.toLowerCase().includes("401")) {
        logout();
      }

      throw err;
    }
  }

  async function handleUpdateExpense(id: number, updatedExpense: ExpenseInput) {
    try {
      const savedExpense = await updateExpenseApi(id, updatedExpense);

      setExpenses((prevExpenses) =>
        prevExpenses.map((item) => (item.id === id ? savedExpense : item))
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update expense";

      if (message.toLowerCase().includes("401")) {
        logout();
      }

      throw err;
    }
  }

  async function handleDeleteExpense(id: number) {
    try {
      await deleteExpense(id);
      setExpenses((prevExpenses) =>
        prevExpenses.filter((item) => item.id !== id)
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete expense";

      if (message.toLowerCase().includes("401")) {
        logout();
      }

      throw err;
    }
  }

  if (authLoading) {
    return (
      <div className="app">
        <p>Checking login...</p>
      </div>
    );
  }

  if (user && loading) {
    return (
      <div className="app">
        <p>Loading Trackly...</p>
      </div>
    );
  }

  if (user && error) {
    return (
      <div className="app">
        <p className="error-text">Error: {error}</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
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
            path="expenses/:id/edit"
            element={
              <EditExpensePage
                expenses={expenses}
                onUpdateExpense={handleUpdateExpense}
              />
            }
          />
          <Route path="reports" element={<ReportsPage expenses={expenses} />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;