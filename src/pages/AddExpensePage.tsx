import { useNavigate } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm.tsx";
import type { ExpenseInput } from "../types/expense.ts";

interface AddExpensePageProps {
  onAddExpense: (newExpense: ExpenseInput) => Promise<void>;
}

function AddExpensePage({ onAddExpense }: AddExpensePageProps) {
  const navigate = useNavigate();

  async function handleAddAndGoBack(newExpense: ExpenseInput) {
    await onAddExpense(newExpense);
    navigate("/");
  }

  return (
    <>
      <section className="hero">
        <h1>Add Expense</h1>
        <p>Create a new expense entry</p>
      </section>

      <ExpenseForm onAddExpense={handleAddAndGoBack} />
    </>
  );
}

export default AddExpensePage;