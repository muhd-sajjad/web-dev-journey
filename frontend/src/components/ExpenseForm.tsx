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
  const [submitError, setSubmitError] = useState("");

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
      setSubmitError("");
      await onAddExpense(newExpense);

      setTitle("");
      setAmount("");
      setCategory("");
      setDate("");
      setErrors({});
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save the expense"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h2>{submitLabel === "Save Changes" ? "Edit Expense" : "Add New Expense"}</h2>

      <div className="field">
        <label htmlFor="expense-title">Title</label>
        <input
          id="expense-title"
          type="text"
          maxLength={100}
          placeholder="Enter title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        {errors.title && <p className="error-text">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="expense-amount">Amount</label>
        <input
          id="expense-amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        {errors.amount && <p className="error-text">{errors.amount}</p>}
      </div>

      <div className="field">
        <label htmlFor="expense-category">Category</label>
        <select
          id="expense-category"
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
        <label htmlFor="expense-date">Date</label>
        <input
          id="expense-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
        {errors.date && <p className="error-text">{errors.date}</p>}
      </div>

      {submitError && <p className="error-text">{submitError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export default ExpenseForm;