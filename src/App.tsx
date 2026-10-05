import { useCallback, useEffect, useState } from "react";
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
  isUnauthorized,
  updateExpense as updateExpenseApi
} from "./lib/api.ts";

function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Logs the user out when the token is rejected (HTTP 401) and returns a
  // message that is safe to show in the UI.
  const handleApiError = useCallback(
    (err: unknown, fallback: string): string => {
      if (isUnauthorized(err)) {
        logout();
      }

      return err instanceof Error ? err.message : fallback;
    },
    [logout]
  );

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setExpenses(await fetchExpenses());
    } catch (err) {
      setError(handleApiError(err, "Failed to load expenses"));
    } finally {
      setLoading(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      setError("");
      return;
    }

    void loadExpenses();
  }, [user, loadExpenses]);

  useEffect(() => {
    document.title = user ? `Trackly (${expenses.length} expenses)` : "Trackly";
  }, [user, expenses.length]);

  async function handleAddExpense(newExpense: ExpenseInput) {
    try {
      const savedExpense = await createExpense(newExpense);
      setExpenses((prev) => [savedExpense, ...prev]);
    } catch (err) {
      handleApiError(err, "Failed to add expense");
      throw err;
    }
  }

  async function handleUpdateExpense(id: number, updatedExpense: ExpenseInput) {
    try {
      const savedExpense = await updateExpenseApi(id, updatedExpense);
      setExpenses((prev) =>
        prev.map((item) => (item.id === id ? savedExpense : item))
      );
    } catch (err) {
      handleApiError(err, "Failed to update expense");
      throw err;
    }
  }

  async function handleDeleteExpense(id: number) {
    try {
      await deleteExpense(id);
      setExpenses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      handleApiError(err, "Failed to delete expense");
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
        <button type="button" onClick={() => void loadExpenses()}>
          Retry
        </button>{" "}
        <button type="button" onClick={logout}>
          Log out
        </button>
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
