import { useState } from "react";
import type { ExpenseInput, ExpenseFormErrors } from "../types/expense.ts";

const categoryChoices = [
  "Food",
  "Transport",
  "Bills",
  "Lifestyle",
  "Health",
  "Education",
  "Entertainment"
];
import type { Expense } from "../types/expense.ts";
interface expenseformprops{
  onAddExpense: (newExpense: ExpenseInput) => void | Promise<void>;
}
function ExpenseForm({ onAddExpense }:expenseformprops) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateForm() {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!amount) {
      newErrors.amount = "Amount is required";
    } else if (Number(amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!category) {
      newErrors.category = "Please select a category";
    }

    if (!date) {
      newErrors.date = "Date is required";
    }

    return newErrors;
  }

  function handleSubmit(event:React.FormEvent ) {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const newExpense = {
      title: title.trim(),
      amount: Number(amount),
      category,
      date
    };

    onAddExpense(newExpense);

    setTitle("");
    setAmount("");
    setCategory("");
    setDate("");
    setErrors({});
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>Add New Expense</h2>

      <div className="field">
        <label>Title</label>
        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        {errors.title && <p className="error-text">{errors.title}</p>}
      </div>

      <div className="field">
        <label>Amount</label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        {errors.amount && <p className="error-text">{errors.amount}</p>}
      </div>

      <div className="field">
        <label>Category</label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="">Select category</option>
          {categoryChoices.map((choice) => (
            <option key={choice} value={choice}>
              {choice}
            </option>
          ))}
        </select>
        {errors.category && <p className="error-text">{errors.category}</p>}
      </div>

      <div className="field">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        {errors.date && <p className="error-text">{errors.date}</p>}
      </div>

      <button type="submit">Add Expense</button>
    </form>
  );
}

export default ExpenseForm;