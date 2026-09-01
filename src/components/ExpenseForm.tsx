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

interface ExpenseFormProps {
  onAddExpense: (newExpense: ExpenseInput) => void | Promise<void>;
  initialValues?: ExpenseInput;
  submitLabel?: string;
}

function ExpenseForm({
  onAddExpense,
  initialValues,
  submitLabel = "Add Expense"
}: ExpenseFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [amount, setAmount] = useState(
    initialValues ? String(initialValues.amount) : ""
  );
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [date, setDate] = useState(initialValues?.date ?? "");
  const [errors, setErrors] = useState<ExpenseFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validateForm(): ExpenseFormErrors {
    const newErrors: ExpenseFormErrors = {};

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const newExpense: ExpenseInput = {
      title: title.trim(),
      amount: Number(amount),
      category,
      date
    };

    try {
      setSubmitting(true);
      await onAddExpense(newExpense);

      setTitle("");
      setAmount("");
      setCategory("");
      setDate("");
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>{submitLabel === "Save Changes" ? "Edit Expense" : "Add New Expense"}</h2>

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

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default ExpenseForm;