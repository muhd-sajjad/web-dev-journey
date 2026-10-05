import { useNavigate, useParams } from "react-router-dom";
import ExpenseForm from "../components/ExpenseForm.tsx";
import type { Expense, ExpenseInput } from "../types/expense.ts";

interface EditExpensePageProps {
  expenses: Expense[];
  onUpdateExpense: (id: number, updatedExpense: ExpenseInput) => Promise<void>;
}

function EditExpensePage({
  expenses,
  onUpdateExpense
}: EditExpensePageProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  const expense = expenses.find((item) => item.id === Number(id));

  if (!expense) {
    return (
      <section className="hero">
        <h1>Expense not found</h1>
        <p>This expense does not exist or is not loaded.</p>
        <button onClick={() => navigate("/")}>Back to Dashboard</button>
      </section>
    );
  }

  async function handleUpdateAndGoBack(updatedExpense: ExpenseInput) {
    await onUpdateExpense(Number(id), updatedExpense);
    navigate("/");
  }

  return (
    <>
      <section className="hero">
        <h1>Edit Expense</h1>
        <p>Update your expense details</p>
      </section>

      <ExpenseForm
        onAddExpense={handleUpdateAndGoBack}
        initialValues={{
          title: expense.title,
          amount: expense.amount,
          category: expense.category,
          date: expense.date
        }}
        submitLabel="Save Changes"
      />
    </>
  );
}

export default EditExpensePage;